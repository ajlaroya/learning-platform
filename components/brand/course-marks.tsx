export function CourseMark({
  type,
}: {
  type: "next" | "docker" | "typescript";
}) {
  if (type === "docker")
    return (
      <span
        className="text-[10px] font-bold uppercase tracking-[-0.08em] text-[#2496ED]"
        aria-hidden="true"
      >
        Docker
      </span>
    );
  if (type === "typescript")
    return (
      <span
        className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#3178c6] text-2xl font-bold text-white"
        aria-hidden="true"
      >
        TS
      </span>
    );
  return (
    <span
      className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-3xl font-medium text-white"
      aria-hidden="true"
    >
      N
    </span>
  );
}
