export function NotesLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full bg-gray-200 rounded mb-1.5" />
          <div className="h-4 w-5/6 bg-gray-200 rounded mb-1.5" />
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
          <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
            <div className="h-11 w-11 bg-gray-200 rounded-lg" />
            <div className="h-11 w-11 bg-gray-200 rounded-lg" />
            <div className="h-11 w-11 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
