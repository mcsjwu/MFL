export default function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="mfl-pagehead">
      <h1 className="mfl-large-title">{title}</h1>
      {sub && <p className="mfl-callout" style={{ margin: 0 }}>{sub}</p>}
    </header>
  );
}
