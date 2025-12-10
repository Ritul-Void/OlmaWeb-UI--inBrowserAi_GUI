export default function Welcome({
  onOpenSettings
}) {
  return React.createElement("div", {
    className: "welcome"
  }, React.createElement("div", {
    className: "welcome-icon"
  }, "\u26A1"), React.createElement("h2", null, "OlmaWeb"), React.createElement("p", null, "Run AI models directly in your browser \u2014 fully local, private, and offline-capable. Powered by Transformers.js with ONNX runtime."), React.createElement("div", {
    className: "welcome-hint"
  }, React.createElement("button", {
    className: "btn btn-primary",
    onClick: onOpenSettings
  }, "Load a Model \u2192")));
}
