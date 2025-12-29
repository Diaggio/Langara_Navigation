function ErrorMessage(props) {
  // If there is no error message, return null (renders nothing)
  if (!props.message) {
    return null;
  }

  return (
    <p style={{ color: "red", fontSize: "0.9rem", margin: "5px 0" }}>
      {props.message}
    </p>
  );
}

export default ErrorMessage;