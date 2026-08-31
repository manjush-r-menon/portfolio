export const INPUT_BASE_CLASSES =
  "block w-full border-0 border-b bg-transparent px-0 py-2 font-sans text-sm text-ink placeholder:text-ink-dim/60 outline-none transition-colors";

export const INPUT_ERROR_CLASSES = "border-red-500 focus:border-red-500";

export const INPUT_NORMAL_CLASSES = "border-line focus:border-accent";

export const getInputClasses = (hasError: boolean) =>
  `${INPUT_BASE_CLASSES} ${hasError ? INPUT_ERROR_CLASSES : INPUT_NORMAL_CLASSES}`;
