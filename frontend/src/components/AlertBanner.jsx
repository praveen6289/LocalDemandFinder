export default function AlertBanner({ title = "Opportunity Alert", message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="alert-banner">
      <div>
        <p className="eyebrow">{title}</p>
        <strong>{message}</strong>
      </div>
    </div>
  );
}

