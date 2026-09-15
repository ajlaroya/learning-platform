type LogoProps = {
  className?: string;
};

export function VertexLogo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 shrink-0">
        <path
          d="M1 18.5 8.5 5.5 12 12.5 15.5 5.5 23 18.5H18.2L15.8 13.4 12 18.8 8.2 13.4 5.8 18.5H1Z"
          fill="currentColor"
          className="text-primary-500"
        />
        <path
          d="M8.5 5.5 12 12.5 15.5 5.5H18.5L14.1 16.4H9.9L5.5 5.5H8.5Z"
          fill="currentColor"
          className="text-primary-500"
        />
      </svg>
      <span className="font-display text-[20px] font-bold tracking-[-0.04em] text-neutral-900">
        Vertex
      </span>
    </div>
  );
}
