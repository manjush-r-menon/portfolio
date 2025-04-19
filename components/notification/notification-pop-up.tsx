"use client";
import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type NotificationPopupProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export default function NotificationPopup({
  message,
  type,
  onClose,
}: NotificationPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const accentColor =
    type === "success"
      ? "text-teal-500 dark:text-teal-300"
      : "text-rose-500 dark:text-rose-300";

  const iconBg =
    type === "success"
      ? "bg-teal-100 dark:bg-teal-700"
      : "bg-rose-100 dark:bg-rose-700";

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-3 shadow-xl">
      <div className={`h-3 w-3 rounded-full ${iconBg}`}></div>
      <p className={`text-sm font-medium ${accentColor}`}>{message}</p>
      <button
        onClick={onClose}
        className="ml-auto rounded p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        aria-label="Close"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
