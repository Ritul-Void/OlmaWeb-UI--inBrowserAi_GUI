import { useState, useCallback, useRef } from 'react';
import { pipeline, env, TextStreamer } from '@huggingface/transformers';

// Configure Transformers.js
env.allowLocalModels = false;
env.allowRemoteModels = true;

export function useModel() {
  const [modelState, setModelState] = useState({
    loaded: false,
    loading: false,
    error: null,
    modelId: null,
  });
  const [progress, setProgress] = useState({
    percent: 0,
    loadedBytes: 0,
    totalBytes: 0,
    speed: 0,
    eta: 0,
    file: '',
    visible: false,
  });
  const [cacheStatus, setCacheStatus] = useState('unknown'); // 'cached' | 'not-cached' | 'unknown'

  const generatorRef = useRef(null);
  const downloadStartRef = useRef(0);
  const fileProgressRef = useRef({});

  // Check if model files are in Cache Storage
  const checkCache = useCallback(async (modelId) => {
    try {
      const cache = await caches.open('transformers-cache');
      const keys = await cache.keys();
      const modelPrefix = modelId.replace('/', '%2F');
      const found = keys.some(req => req.url.includes(modelPrefix) || req.url.includes(modelId));
      setCacheStatus(found ? 'cached' : 'not-cached');
      return found;
    } catch {
      // Also check for huggingface cache pattern
      try {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          const found = keys.some(req => 
            req.url.includes(modelId) || req.url.includes(modelId.replace('/', '%2F'))
          );
          if (found) {
            setCacheStatus('cached');
            return true;
          }
        }
      } catch {}
      setCacheStatus('unknown');
      return false;
    }
  }, []);

  // Clear cached model files
  const clearCache = useCallback(async () => {
    try {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
      setCacheStatus('not-cached');
      return true;
    } catch (e) {
      console.error('Failed to clear cache:', e);
      return false;
    }
  }, []);

  // Get approximate cache size
  const getCacheSize = useCallback(async () => {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        return { usage: est.usage || 0, quota: est.quota || 0 };
      }
    } catch {}
    return { usage: 0, quota: 0 };
  }, []);

  // Progress callback
  const onProgress = useCallback((event) => {
    if (!event) return;

    if (event.status === 'progress' && event.file) {
      fileProgressRef.current[event.file] = {
        loaded: event.loaded || 0,
        total: event.total || 0,
      };

      let sumLoaded = 0, sumTotal = 0;
      for (const f of Object.values(fileProgressRef.current)) {
        sumLoaded += f.loaded;
        sumTotal += f.total;
      }

      const pct = sumTotal > 0 ? Math.round((sumLoaded / sumTotal) * 100) : 0;
      const elapsed = (Date.now() - downloadStartRef.current) / 1000;
      const speed = elapsed > 0 ? sumLoaded / elapsed : 0;
      const eta = speed > 0 ? (sumTotal - sumLoaded) / speed : 0;

      setProgress({
        percent: Math.min(pct, 100),
        loadedBytes: sumLoaded,
        totalBytes: sumTotal,
        speed,
        eta,
        file: event.file,
        visible: true,
      });
    } else if (event.status === 'initiate') {
      setProgress(prev => ({ ...prev, file: event.file || '', visible: true }));
    }
  }, []);

  // Load model
  const loadModel = useCallback(async (modelId, dtype = 'q4', device = 'wasm') => {
    if (modelState.loading) return;

    setModelState({ loaded: false, loading: true, error: null, modelId });
    setProgress({ percent: 0, loadedBytes: 0, totalBytes: 0, speed: 0, eta: 0, file: '', visible: true });
    downloadStartRef.current = Date.now();
    fileProgressRef.current = {};

    try {
      // Try WebGPU, fall back to wasm
      let actualDevice = device;
      if (device === 'webgpu') {
        try {
          if (!navigator.gpu) throw new Error('WebGPU not available');
          await navigator.gpu.requestAdapter();
        } catch {
          console.warn('WebGPU not available, falling back to WASM');
          actualDevice = 'wasm';
        }
      }

      const generator = await pipeline('text-generation', modelId, {
        dtype,
        device: actualDevice,
        progress_callback: onProgress,
      });

      generatorRef.current = generator;
      setModelState({ loaded: true, loading: false, error: null, modelId });
      setProgress(prev => ({ ...prev, percent: 100 }));
      setCacheStatus('cached');
      return true;
    } catch (err) {
      console.error('Model load error:', err);
      setModelState({ loaded: false, loading: false, error: err.message, modelId: null });
      return false;
    }
  }, [modelState.loading, onProgress]);

  // Generate text (streaming)
  const generate = useCallback(async (messages, options = {}, onToken) => {
    const gen = generatorRef.current;
    if (!gen) throw new Error('Model not loaded');

    const {
      maxTokens = 512,
      temperature = 0.7,
      topP = 0.9,
      topK = 50,
      repetitionPenalty = 1.1,
      doSample = true,
    } = options;

    let fullOutput = '';
    const streamer = new TextStreamer(gen.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token) => {
        fullOutput += token;
        if (onToken) onToken(fullOutput, token);
      },
    });

    const genOptions = {
      max_new_tokens: maxTokens,
      temperature,
      top_p: topP,
      do_sample: doSample,
      streamer,
    };

    // Only add top_k and repetition_penalty if sampling
    if (doSample) {
      genOptions.top_k = topK;
      if (repetitionPenalty !== 1.0) {
        genOptions.repetition_penalty = repetitionPenalty;
      }
    }

    await gen(messages, genOptions);
    return fullOutput;
  }, []);

  // Unload model
  const unloadModel = useCallback(() => {
    generatorRef.current = null;
    setModelState({ loaded: false, loading: false, error: null, modelId: null });
    setProgress({ percent: 0, loadedBytes: 0, totalBytes: 0, speed: 0, eta: 0, file: '', visible: false });
  }, []);

  return {
    modelState,
    progress,
    cacheStatus,
    loadModel,
    generate,
    unloadModel,
    checkCache,
    clearCache,
    getCacheSize,
  };
}
