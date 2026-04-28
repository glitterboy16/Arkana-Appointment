import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function InputFieldClase({
  label,
  error,
  id,
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="app-muted mb-1 block text-sm font-medium">
        {label}
      </label>

      <input
        id={id}
className={`app-input block w-full rounded-xl border p-3 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-300 ${className}`}        
{...props}
      />

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
