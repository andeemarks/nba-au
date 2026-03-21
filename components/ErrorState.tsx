type Props = {
  onRetry: () => void;
};

export default function ErrorState({ onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 px-8 py-16 text-center">
      <p className="text-lg font-medium text-red-700">
        Could not load player data
      </p>
      <p className="text-sm text-red-500">
        There was a problem reaching the NBA Stats API. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
