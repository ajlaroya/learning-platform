export function ChartDecoration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-44 overflow-hidden opacity-80"
    >
      <div className="absolute bottom-0 left-0 flex h-full w-[42%] items-end blur-[10px]">
        {[24, 48, 72, 108, 76, 48, 24].map((height, index) => (
          <div
            key={index}
            className="flex-1 bg-linear-to-t from-primary-300/80 to-primary-100/10"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="absolute bottom-0 right-0 flex h-full w-[42%] items-end blur-[10px]">
        {[18, 50, 82, 96, 60, 30, 68, 42].map((height, index) => (
          <div
            key={index}
            className="flex-1 bg-linear-to-t from-primary-300/80 to-primary-100/10"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
