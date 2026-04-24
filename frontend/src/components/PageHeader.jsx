export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

