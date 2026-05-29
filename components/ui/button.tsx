import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-transform duration-200 hover:-translate-y-0.5";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-surface shadow-[0_4px_16px_oklch(38%_0.045_130/0.28)] hover:bg-primary-hover",
  secondary:
    "border border-border bg-surface text-fg shadow-soft hover:border-[oklch(72%_0.085_75/0.5)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-[22px] py-3.5 text-sm",
  md: "px-[30px] py-[15px] text-[15px]",
  lg: "px-[34px] py-4 text-base",
};

type SharedProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsAnchor = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonProps = ButtonAsAnchor | ButtonAsButton;

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
