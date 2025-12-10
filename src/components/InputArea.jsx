import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
export default function InputArea({
  onSend,
  disabled,
  isGenerating
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }
  }, [text]);
  const handleSend = () => {
    if (!text.trim() || disabled || isGenerating) return;
    onSend(text.trim());
    setText('');
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return React.createElement("div", {
    className: "input-area"
  }, React.createElement("div", {
    className: "input-container"
  }, React.createElement("textarea", {
    ref: textareaRef,
    rows: 1,
    value: text,
    onChange: e => setText(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder: disabled ? 'Load a model first…' : 'Type a message…',
    disabled: disabled
  }), React.createElement("button", {
    className: "send-btn",
    onClick: handleSend,
    disabled: disabled || !text.trim() || isGenerating,
    title: "Send message"
  }, React.createElement(Icons.Send, null))), React.createElement("div", {
    className: "input-hint"
  }, "Enter to send \xB7 Shift+Enter for new line"));
}
