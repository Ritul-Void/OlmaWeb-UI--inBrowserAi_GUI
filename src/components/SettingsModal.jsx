import { useEffect, useState } from 'react';
import { Icons } from './Icons';
import { MODEL_OPTIONS, DTYPE_OPTIONS, DEVICE_OPTIONS } from '../hooks/useSettings';
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}
export default function SettingsModal({
  open,
  onClose,
  settings,
  updateSetting,
  resetSettings,
  modelState,
  progress,
  cacheStatus,
  onLoadModel,
  onClearCache,
  getCacheSize
}) {
  const [cacheSize, setCacheSize] = useState(null);
  const [customModel, setCustomModel] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  useEffect(() => {
    if (open) {
      getCacheSize().then(setCacheSize);
    }
  }, [open, getCacheSize]);
  const handleLoadModel = () => {
    const modelId = showCustom ? customModel.trim() : settings.modelId;
    if (modelId) onLoadModel(modelId, settings.dtype, settings.device);
  };
  const handleClearCache = async () => {
    if (window.confirm('Clear all cached model files? You will need to re-download models.')) {
      await onClearCache();
      getCacheSize().then(setCacheSize);
    }
  };
  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) onClose();
  };
  return React.createElement("div", {
    className: `modal-overlay ${open ? 'open' : ''}`,
    onClick: handleOverlayClick
  }, React.createElement("div", {
    className: "modal"
  }, React.createElement("div", {
    className: "modal-header"
  }, React.createElement("h2", null, "Settings"), React.createElement("button", {
    className: "icon-btn",
    onClick: onClose,
    title: "Close"
  }, React.createElement(Icons.X, null))), React.createElement("div", {
    className: "modal-body"
  }, React.createElement("div", {
    className: "settings-section"
  }, React.createElement("div", {
    className: "settings-section-title"
  }, "Model"), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Model"), !showCustom ? React.createElement("select", {
    value: settings.modelId,
    onChange: e => updateSetting('modelId', e.target.value),
    disabled: modelState.loading
  }, MODEL_OPTIONS.map(m => React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.label, " (", m.size, ")"))) : React.createElement("input", {
    type: "text",
    value: customModel,
    onChange: e => setCustomModel(e.target.value),
    placeholder: "e.g. onnx-community/Qwen2.5-0.5B-Instruct",
    disabled: modelState.loading
  }), React.createElement("button", {
    className: "btn btn-secondary",
    style: {
      fontSize: '11px',
      padding: '4px 10px',
      alignSelf: 'flex-start',
      marginTop: '2px'
    },
    onClick: () => setShowCustom(!showCustom)
  }, showCustom ? '← Back to list' : 'Use custom model ID')), React.createElement("div", {
    className: "download-section"
  }, React.createElement("h3", null, "Model Download", React.createElement("span", {
    className: `cache-badge ${cacheStatus === 'cached' ? 'cached' : 'not-cached'}`
  }, cacheStatus === 'cached' ? 'Cached' : cacheStatus === 'not-cached' ? 'Not cached' : '…')), progress.visible && React.createElement("div", {
    className: "progress-wrap"
  }, React.createElement("div", {
    className: "progress-bar-bg"
  }, React.createElement("div", {
    className: "progress-bar-fill",
    style: {
      width: `${Math.min(progress.percent, 100)}%`
    }
  })), React.createElement("div", {
    className: "progress-info"
  }, React.createElement("span", null, progress.percent, "%"), React.createElement("span", null, formatBytes(progress.loadedBytes), " / ", progress.totalBytes > 0 ? formatBytes(progress.totalBytes) : '?', progress.speed > 0 && ` · ${formatBytes(progress.speed)}/s`, progress.eta > 0 && ` · ${Math.ceil(progress.eta)}s left`)), progress.file && React.createElement("div", {
    className: "field-desc",
    style: {
      marginTop: '4px',
      fontFamily: 'var(--font-mono)'
    }
  }, progress.file)), React.createElement("button", {
    className: "btn btn-primary btn-full",
    style: {
      marginTop: '10px'
    },
    onClick: handleLoadModel,
    disabled: modelState.loading || modelState.loaded
  }, modelState.loading ? 'Downloading…' : modelState.loaded ? '✓ Model Loaded' : cacheStatus === 'cached' ? 'Load from Cache' : 'Download & Load Model'), modelState.error && React.createElement("div", {
    className: "dl-status error"
  }, "Error: ", modelState.error), modelState.loaded && React.createElement("div", {
    className: "dl-status ready"
  }, "Ready \u2014 ", modelState.modelId?.split('/').pop())), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Quantization (dtype)"), React.createElement("select", {
    value: settings.dtype,
    onChange: e => updateSetting('dtype', e.target.value),
    disabled: modelState.loading || modelState.loaded
  }, DTYPE_OPTIONS.map(d => React.createElement("option", {
    key: d.value,
    value: d.value
  }, d.label, " \u2014 ", d.desc))), React.createElement("span", {
    className: "field-desc"
  }, "Lower precision = smaller download, less RAM, slightly lower quality")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Device"), React.createElement("select", {
    value: settings.device,
    onChange: e => updateSetting('device', e.target.value),
    disabled: modelState.loading || modelState.loaded
  }, DEVICE_OPTIONS.map(d => React.createElement("option", {
    key: d.value,
    value: d.value
  }, d.label, " \u2014 ", d.desc))), React.createElement("span", {
    className: "field-desc"
  }, "WebGPU offers GPU acceleration but requires browser support")), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px'
    }
  }, React.createElement("span", {
    className: "field-desc"
  }, "Cache: ", cacheSize ? formatBytes(cacheSize.usage) : '…', " used"), React.createElement("button", {
    className: "btn btn-danger",
    style: {
      fontSize: '11px',
      padding: '4px 10px'
    },
    onClick: handleClearCache
  }, "Clear Cache"))), React.createElement("div", {
    className: "settings-section"
  }, React.createElement("div", {
    className: "settings-section-title"
  }, "Generation"), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "System Prompt"), React.createElement("textarea", {
    value: settings.systemPrompt,
    onChange: e => updateSetting('systemPrompt', e.target.value),
    placeholder: "You are a helpful assistant...",
    rows: 3
  }), React.createElement("span", {
    className: "field-desc"
  }, "Sets the AI's behavior and personality")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Temperature"), React.createElement("div", {
    className: "slider-row"
  }, React.createElement("input", {
    type: "range",
    min: "0",
    max: "2",
    step: "0.05",
    value: settings.temperature,
    onChange: e => updateSetting('temperature', parseFloat(e.target.value))
  }), React.createElement("span", {
    className: "slider-val"
  }, settings.temperature.toFixed(2))), React.createElement("span", {
    className: "field-desc"
  }, "Lower = more focused, higher = more creative")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Max New Tokens"), React.createElement("input", {
    type: "number",
    min: 64,
    max: 4096,
    step: 64,
    value: settings.maxTokens,
    onChange: e => updateSetting('maxTokens', parseInt(e.target.value) || 512)
  }), React.createElement("span", {
    className: "field-desc"
  }, "Maximum number of tokens to generate per response")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Top-p (Nucleus Sampling)"), React.createElement("div", {
    className: "slider-row"
  }, React.createElement("input", {
    type: "range",
    min: "0.1",
    max: "1",
    step: "0.05",
    value: settings.topP,
    onChange: e => updateSetting('topP', parseFloat(e.target.value))
  }), React.createElement("span", {
    className: "slider-val"
  }, settings.topP.toFixed(2))), React.createElement("span", {
    className: "field-desc"
  }, "Cumulative probability threshold for token selection")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Top-k"), React.createElement("div", {
    className: "slider-row"
  }, React.createElement("input", {
    type: "range",
    min: "1",
    max: "100",
    step: "1",
    value: settings.topK,
    onChange: e => updateSetting('topK', parseInt(e.target.value))
  }), React.createElement("span", {
    className: "slider-val"
  }, settings.topK)), React.createElement("span", {
    className: "field-desc"
  }, "Number of top tokens to consider (0 = disabled)")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    className: "field-label"
  }, "Repetition Penalty"), React.createElement("div", {
    className: "slider-row"
  }, React.createElement("input", {
    type: "range",
    min: "1.0",
    max: "2.0",
    step: "0.05",
    value: settings.repetitionPenalty,
    onChange: e => updateSetting('repetitionPenalty', parseFloat(e.target.value))
  }), React.createElement("span", {
    className: "slider-val"
  }, settings.repetitionPenalty.toFixed(2))), React.createElement("span", {
    className: "field-desc"
  }, "Penalizes repeated tokens. 1.0 = no penalty")), React.createElement("div", {
    className: "toggle-row"
  }, React.createElement("div", null, React.createElement("div", {
    className: "field-label"
  }, "Sampling"), React.createElement("div", {
    className: "field-desc"
  }, "Enable stochastic sampling (disable for greedy decoding)")), React.createElement("label", {
    className: "toggle-switch"
  }, React.createElement("input", {
    type: "checkbox",
    checked: settings.doSample,
    onChange: e => updateSetting('doSample', e.target.checked)
  }), React.createElement("span", {
    className: "toggle-track"
  }))), React.createElement("div", {
    className: "toggle-row"
  }, React.createElement("div", null, React.createElement("div", {
    className: "field-label"
  }, "Stream Output"), React.createElement("div", {
    className: "field-desc"
  }, "Show tokens as they are generated")), React.createElement("label", {
    className: "toggle-switch"
  }, React.createElement("input", {
    type: "checkbox",
    checked: settings.streamOutput,
    onChange: e => updateSetting('streamOutput', e.target.checked)
  }), React.createElement("span", {
    className: "toggle-track"
  }))))), React.createElement("div", {
    className: "modal-footer"
  }, React.createElement("button", {
    className: "btn btn-secondary",
    onClick: resetSettings
  }, "Reset Defaults"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: onClose
  }, "Done"))));
}
