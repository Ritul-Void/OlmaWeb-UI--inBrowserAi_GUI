import { useState, useCallback, useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import { useModel } from './hooks/useModel';
import { useChat } from './hooks/useChat';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SettingsModal from './components/SettingsModal';
import FloatingNotification from './components/FloatingNotification';
export default function App() {
  const {
    settings,
    updateSetting,
    resetSettings
  } = useSettings();
  const {
    modelState,
    progress,
    cacheStatus,
    loadModel,
    generate,
    unloadModel,
    checkCache,
    clearCache,
    getCacheSize
  } = useModel();
  const {
    messages,
    isGenerating,
    streamingText,
    sendMessage,
    clearChat
  } = useChat();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [floatNotifVisible, setFloatNotifVisible] = useState(false);
  const [theme, setTheme] = useState(settings.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    updateSetting('theme', theme);
  }, [theme]);
  useEffect(() => {
    checkCache(settings.modelId);
  }, [settings.modelId]);
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);
  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
    setFloatNotifVisible(false);
  }, []);
  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
    if (modelState.loading) {
      setFloatNotifVisible(true);
    }
  }, [modelState.loading]);
  const handleLoadModel = useCallback(async (modelId, dtype, device) => {
    const ok = await loadModel(modelId, dtype, device);
    if (ok) {
      setFloatNotifVisible(false);
    }
  }, [loadModel]);
  const handleClearCache = useCallback(async () => {
    const ok = await clearCache();
    if (ok) {
      unloadModel();
      checkCache(settings.modelId);
    }
  }, [clearCache, unloadModel, checkCache, settings.modelId]);
  useEffect(() => {
    if (modelState.loaded) {
      setFloatNotifVisible(false);
    }
  }, [modelState.loaded]);
  const handleSend = useCallback(text => {
    sendMessage(text, settings.systemPrompt, generate, {
      maxTokens: settings.maxTokens,
      temperature: settings.temperature,
      topP: settings.topP,
      topK: settings.topK,
      repetitionPenalty: settings.repetitionPenalty,
      doSample: settings.doSample
    });
  }, [sendMessage, generate, settings]);
  return React.createElement("div", {
    className: "app-shell"
  }, React.createElement(Header, {
    modelState: modelState,
    theme: theme,
    onToggleTheme: toggleTheme,
    onOpenSettings: handleOpenSettings,
    onClearChat: clearChat
  }), React.createElement(ChatArea, {
    messages: messages,
    isGenerating: isGenerating,
    streamingText: streamingText,
    modelLoaded: modelState.loaded,
    onOpenSettings: handleOpenSettings
  }), React.createElement(InputArea, {
    onSend: handleSend,
    disabled: !modelState.loaded,
    isGenerating: isGenerating
  }), React.createElement(SettingsModal, {
    open: settingsOpen,
    onClose: handleCloseSettings,
    settings: settings,
    updateSetting: updateSetting,
    resetSettings: resetSettings,
    modelState: modelState,
    progress: progress,
    cacheStatus: cacheStatus,
    onLoadModel: handleLoadModel,
    onClearCache: handleClearCache,
    getCacheSize: getCacheSize
  }), React.createElement(FloatingNotification, {
    visible: floatNotifVisible,
    percent: progress.percent,
    onOpen: handleOpenSettings,
    onDismiss: () => setFloatNotifVisible(false)
  }));
}
