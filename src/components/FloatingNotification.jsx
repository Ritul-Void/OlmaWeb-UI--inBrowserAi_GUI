export default function FloatingNotification({
  visible,
  percent,
  onOpen,
  onDismiss
}) {
  return React.createElement("div", {
    className: `float-notif ${visible ? 'show' : ''}`,
    onClick: onOpen
  }, React.createElement("div", {
    className: "float-notif-header"
  }, React.createElement("span", null, percent >= 100 ? '✓ Model loaded' : `Downloading model… ${percent}%`), React.createElement("button", {
    className: "float-notif-cancel",
    onClick: e => {
      e.stopPropagation();
      onDismiss();
    },
    title: "Dismiss"
  }, "\u2715")), React.createElement("div", {
    className: "progress-bar-bg"
  }, React.createElement("div", {
    className: "progress-bar-fill",
    style: {
      width: `${Math.min(percent, 100)}%`
    }
  })));
}
