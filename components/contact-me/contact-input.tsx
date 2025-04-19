export default function Input({
  id,
  label,
  type = "text",
  autoComplete,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm/6 font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <div className="mt-2.5">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 dark:bg-zinc-800/90 dark:text-zinc-100 dark:outline-zinc-600 dark:placeholder:text-zinc-500 dark:focus:outline-teal-400"
          {...props}
        />
      </div>
    </div>
  );
}
