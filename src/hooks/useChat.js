import { useState, useCallback, useRef } from 'react';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const abortRef = useRef(false);

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, { role, content, id: Date.now() + Math.random() }]);
  }, []);

  const sendMessage = useCallback(async (text, systemPrompt, generate, genOptions) => {
    if (!text.trim() || isGenerating) return;

    // Add user message
    const userMsg = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, userMsg].slice(0)); // force re-render
    setMessages(prev => [...prev, userMsg]);

    setIsGenerating(true);
    setStreamingText('');
    abortRef.current = false;

    try {
      // Build messages array with system prompt
      const chatMessages = [];
      if (systemPrompt && systemPrompt.trim()) {
        chatMessages.push({ role: 'system', content: systemPrompt.trim() });
      }
      // Include conversation history
      for (const msg of [...messages, userMsg]) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }

      const fullOutput = await generate(
        chatMessages,
        genOptions,
        (accumulated) => {
          setStreamingText(accumulated);
        }
      );

      // Add assistant message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: fullOutput, id: Date.now() + Math.random() }
      ]);
      setStreamingText('');
    } catch (err) {
      console.error('Generation error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠ Error: ${err.message}`, id: Date.now() }
      ]);
      setStreamingText('');
    }

    setIsGenerating(false);
  }, [messages, isGenerating]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setStreamingText('');
  }, []);

  return {
    messages,
    isGenerating,
    streamingText,
    sendMessage,
    clearChat,
    addMessage,
  };
}
