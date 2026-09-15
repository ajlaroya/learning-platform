import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";
type ButtonSize = "lg" | "md";

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>;

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed";

const sizeClass: Record<ButtonSize, string> = {
  lg: "h-11 px-4 text-sm",
  md: "h-10 px-3 text-xs",
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-100 disabled:text-primary-300",
  secondary:
    "border border-primary-500 bg-white text-primary-500 hover:bg-primary-100 disabled:border-primary-200 disabled:text-primary-300",
  tertiary:
    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 disabled:border-neutral-200 disabled:text-neutral-300",
  text: "bg-transparent text-primary-500 hover:text-primary-600 disabled:text-primary-300",
};

export function Button({
  variant = "primary",
  size = "lg",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseClass,
        sizeClass[size],
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "lg",
  className,
  children,
  ...props
}: LinkProps) {
  return (
    <a
      className={cn(
        baseClass,
        sizeClass[size],
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function TextButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-full text-sm font-medium text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary-500 text-primary-500">
        <Play className="h-3 w-3 fill-current" />
      </span>
      {children}
    </button>
  );
}

export function ExternalLinkButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}
