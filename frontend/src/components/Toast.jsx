function Toast({ message, visible = true }) {
  if (!visible) return null;

  return (
    <div className="toast">
      {message}
    </div>
  );
}

export default Toast;
