import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'olma-settings';

const DEFAULT_SETTINGS = {
  // Model
  modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
  
  // Transformers.js config
  dtype: 'q4',
  device: 'wasm', // 'wasm' | 'webgpu'
  
  // Generation params
  systemPrompt: 'You are a helpful, concise AI assistant.',
  temperature: 0.7,
  maxTokens: 512,
  topP: 0.9,
  topK: 50,
  repetitionPenalty: 1.1,
  doSample: true,
  
  // UI
  theme: 'dark',
  streamOutput: true,
};

const MODEL_OPTIONS = [
  { id: 'onnx-community/Qwen2.5-0.5B-Instruct', label: 'Qwen 2.5 0.5B Instruct', size: '~400 MB' },
  { id: 'onnx-community/Qwen2.5-1.5B-Instruct', label: 'Qwen 2.5 1.5B Instruct', size: '~1.1 GB' },
  { id: 'onnx-community/SmolLM2-360M-Instruct', label: 'SmolLM2 360M Instruct', size: '~250 MB' },
  { id: 'onnx-community/Phi-3.5-mini-instruct', label: 'Phi-3.5 Mini Instruct', size: '~2.3 GB' },
];

const DTYPE_OPTIONS = [
  { value: 'q4', label: 'Q4 (4-bit quantized)', desc: 'Smallest, fastest' },
  { value: 'q4f16', label: 'Q4F16 (4-bit + fp16)', desc: 'Good balance' },
  { value: 'q8', label: 'Q8 (8-bit quantized)', desc: 'Better quality' },
  { value: 'fp16', label: 'FP16 (half precision)', desc: 'High quality, large' },
  { value: 'fp32', label: 'FP32 (full precision)', desc: 'Highest quality, very large' },
];

const DEVICE_OPTIONS = [
  { value: 'wasm', label: 'CPU (WebAssembly)', desc: 'Most compatible' },
  { value: 'webgpu', label: 'GPU (WebGPU)', desc: 'Faster if supported' },
];

export { MODEL_OPTIONS, DTYPE_OPTIONS, DEVICE_OPTIONS, DEFAULT_SETTINGS };

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, resetSettings };
}
