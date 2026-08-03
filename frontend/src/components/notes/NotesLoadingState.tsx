export function NotesLoadingState() {
  return (
    <div
      className="mt-8"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading notes</span>
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-memo-md bg-card-surface p-6 shadow-memo-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 animate-pulse rounded-full bg-skeleton" />
              <div className="h-4 w-20 animate-pulse rounded bg-skeleton" />
            </div>
            <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-skeleton" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-skeleton" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-skeleton" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
