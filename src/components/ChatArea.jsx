import { useEffect, useRef } from 'react';
import Welcome from './Welcome';
function MessageBubble({
  role,
  content
}) {
  return React.createElement("div", {
    className: `msg ${role}`
  }, React.createElement("div", {
    className: "avatar"
  }, role === 'user' ? 'U' : 'AI'), React.createElement("div", {
    className: "bubble"
  }, content));
}
function StreamingBubble({
  text
}) {
  return React.createElement("div", {
    className: "msg assistant"
  }, React.createElement("div", {
    className: "avatar"
  }, "AI"), React.createElement("div", {
    className: "bubble"
  }, text, React.createElement("span", {
    className: "typing-cursor"
  })));
}
export default function ChatArea({
  messages,
  isGenerating,
  streamingText,
  modelLoaded,
  onOpenSettings
}) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, streamingText]);
  const isEmpty = messages.length === 0 && !isGenerating;
  return React.createElement("div", {
    className: "chat-area"
  }, isEmpty && !modelLoaded && React.createElement(Welcome, {
    onOpenSettings: onOpenSettings
  }), isEmpty && modelLoaded && React.createElement("div", {
    className: "welcome"
  }, React.createElement("div", {
    className: "welcome-icon"
  }, "\uD83D\uDCAC"), React.createElement("h2", null, "Ready to chat"), React.createElement("p", null, "Type a message below to start a conversation with your local AI model.")), messages.map((msg, i) => React.createElement(MessageBubble, {
    key: msg.id || i,
    role: msg.role,
    content: msg.content
  })), isGenerating && streamingText && React.createElement(StreamingBubble, {
    text: streamingText
  }), isGenerating && !streamingText && React.createElement("div", {
    className: "msg assistant"
  }, React.createElement("div", {
    className: "avatar"
  }, "AI"), React.createElement("div", {
    className: "bubble"
  }, React.createElement("span", {
    className: "typing-cursor"
  }))), React.createElement("div", {
    ref: bottomRef
  }));
}
