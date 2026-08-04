export function AuthHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-7">
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-ink-secondary">
        {description}
      </p>
    </header>
  );
}
