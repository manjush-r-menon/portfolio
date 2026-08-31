export const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://github.com/manjush-r-menon", label: "Github" },
  { href: "https://www.linkedin.com/in/manjush-menon/", label: "LinkedIn" },
  { href: "mailto:manjushrmenon730@gmail.com", label: "Email" },
] as const;

export const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/work": "Work",
  "/about": "About",
  "/contact": "Contact",
};
