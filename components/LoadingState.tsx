const SKELETON_ROWS = 8;
const SKELETON_COLS = 13;

export default function LoadingState() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-900">
            {Array.from({ length: SKELETON_COLS }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-12 rounded bg-gray-700 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: SKELETON_ROWS }).map((_, row) => (
            <tr key={row} className={row % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {Array.from({ length: SKELETON_COLS }).map((_, col) => (
                <td key={col} className="px-4 py-3">
                  <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: col === 0 ? "120px" : "40px" }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
