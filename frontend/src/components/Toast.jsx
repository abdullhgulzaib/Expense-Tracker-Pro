function Toast({ message, visible = true, type = 'success' }) {
  if (!visible) return null;

  return (
    <div className={`toast toast--${type}`}>
      {message}
    </div>
  );
}

export default Toast;