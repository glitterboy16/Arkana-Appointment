import type { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectClaseProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  label: string;
}

export default function Select({ options, label, id, className = "", ...props }: SelectClaseProps) {
  const selectId = id || props.name || label;

  return (
    <div>
      <label htmlFor={selectId} className="app-muted mb-1 block text-sm font-medium">
        {label}
      </label>

      <select
        id={selectId}
        className={`app-input block w-full rounded-xl border p-3 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-300 ${className}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
