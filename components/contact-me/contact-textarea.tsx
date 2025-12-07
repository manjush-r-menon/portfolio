import { getInputClasses } from './input-styles';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
        className="block text-sm/6 font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <div className="mt-2.5">
        <textarea
          id={id}
          className={getInputClasses(!!error)}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
