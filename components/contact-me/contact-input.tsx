import { getInputClasses } from "./input-styles";

export default function Input({
  id,
  label,
  type = "text",
  autoComplete,
  className,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-sans text-xs tracking-[0.06em] text-ink-dim uppercase"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          className={getInputClasses(!!error)}
          {...props}
        />
        {error && (
          <p className="mt-1.5 font-sans text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
