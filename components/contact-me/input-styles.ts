export const INPUT_BASE_CLASSES =
  'block w-full rounded-md bg-white px-3.5 py-2 text-base text-zinc-900 outline-1 -outline-offset-1 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 dark:bg-zinc-800/90 dark:text-zinc-100 dark:placeholder:text-zinc-500';

export const INPUT_ERROR_CLASSES =
  'outline-red-500 focus:outline-red-500 dark:outline-red-500 dark:focus:outline-red-500';

export const INPUT_NORMAL_CLASSES =
  'outline-zinc-300 focus:outline-teal-500 dark:outline-zinc-600 dark:focus:outline-teal-400';

export const getInputClasses = (hasError: boolean) =>
  `${INPUT_BASE_CLASSES} ${hasError ? INPUT_ERROR_CLASSES : INPUT_NORMAL_CLASSES}`;
