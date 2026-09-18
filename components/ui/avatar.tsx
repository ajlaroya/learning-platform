export function Avatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary-200 text-sm font-semibold text-neutral-900 shadow-sm"
      aria-label={`${name} profile`}
    >
      <span aria-hidden="true">
        {name
          .split(" ")
          .map((part) => part[0])
          .join("")}
      </span>
    </div>
  );
}
