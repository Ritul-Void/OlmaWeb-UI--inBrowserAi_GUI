import { Icons } from './Icons';
export default function Header({
  modelState,
  theme,
  onToggleTheme,
  onOpenSettings,
  onClearChat
}) {
  return React.createElement("div", {
    className: "header"
  }, React.createElement("div", {
    className: "header-left"
  }, React.createElement("div", {
    className: "logo"
  }, "O"), React.createElement("span", {
    className: "header-title"
  }, "OlmaWeb"), React.createElement("span", {
    className: `model-badge ${modelState.loaded ? 'loaded' : ''}`
  }, modelState.loaded ? modelState.modelId?.split('/').pop() : 'no model')), React.createElement("div", {
    className: "header-actions"
  }, React.createElement("button", {
    className: "icon-btn",
    onClick: onClearChat,
    title: "Clear chat"
  }, React.createElement(Icons.Trash, null)), React.createElement("button", {
    className: "icon-btn",
    onClick: onToggleTheme,
    title: "Toggle theme"
  }, theme === 'dark' ? React.createElement(Icons.Moon, null) : React.createElement(Icons.Sun, null)), React.createElement("button", {
    className: "icon-btn",
    onClick: onOpenSettings,
    title: "Settings"
  }, React.createElement(Icons.Settings, null))));
}
