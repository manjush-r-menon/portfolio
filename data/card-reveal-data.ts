export type CardRevealCategory = {
  id: string;
  index: string;
  issuer: string;
  date: string;
  title: string;
  description: string;
};

export const CARD_REVEAL_CATEGORIES: CardRevealCategory[] = [
  {
    id: "angular",
    index: "01",
    issuer: "UDEMY",
    date: "APRIL 20, 2025",
    title: "Angular – The Complete Guide (2025 Edition)",
    description:
      "Went deep enough into Angular to argue about RxJS operators at parties. Component architecture, reactive programming, state management — the whole enterprise-grade toolkit.",
  },
  {
    id: "typescript",
    index: "02",
    issuer: "FRONTENDMASTERS",
    date: "JAN 18, 2024",
    title: "Fundamentals of TypeScript",
    description:
      "The course that finally made any feel like a swear word. Static typing, modern ECMAScript, and code my future self can actually maintain.",
  },
  {
    id: "bootcamp",
    index: "03",
    issuer: "UDEMY",
    date: "AUGUST 26, 2023",
    title: "The Web Developer Bootcamp 2023",
    description:
      "Where it all started — full-stack, start to finish, before I knew what half the acronyms meant.",
  },
];
