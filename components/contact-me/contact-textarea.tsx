import { getInputClasses } from "./input-styles";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function Textarea({
  id,
  label,
  className,
  error,
  ...props
}: TextareaProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-sans text-xs tracking-[0.06em] text-ink-dim uppercase"
      >
        {label}
      </label>
      <div className="mt-2">
        <textarea id={id} className={getInputClasses(!!error)} {...props} />
        {error && (
          <p className="mt-1.5 font-sans text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
