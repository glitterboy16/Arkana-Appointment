import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium transition hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70";
  const variants = {
    primary: "btn-primary shadow-sm",
    secondary: "app-secondary border hover:border-primary-500 hover:text-primary-600",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
