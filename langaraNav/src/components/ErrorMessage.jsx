function ErrorMessage(props) {
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