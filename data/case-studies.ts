export type CaseStudy = {
  index: string;
  title: string;
  role?: string;
  description: string;
  tags?: string[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    index: "01",
    title: "Asking better questions",
    description:
      "A payment module for an artist marketplace, on paper. In practice, a crash course in figuring out what a client actually means before touching a single line of code.",
    tags: ["React", "Java", "Spring Boot", "H2 Database", "Selenium", "JIRA"],
  },
  {
    index: "02",
    title: "Building blocks that behave",
    description:
      "Built and maintained reusable React components for B2X Commerce — the unglamorous work of making sure buttons, forms, and cards look and feel the same everywhere, every time.",
  },
  {
    index: "03",
    title: "An excuse to learn Next.js",
    role: "Frontend Developer",
    description:
      "A responsive car rental interface, technically. Really it was a training exercise to actually learn Next.js fundamentals and modern frontend patterns — not just claim I did.",
    tags: ["Next.js", "Tailwind"],
  },
  {
    index: "04",
    title: "Learning to own it",
    role: "Frontend Developer (client project, name withheld under NDA)",
    description:
      'Two applications, one client: a responsive Angular front-end with proper state management and a BFF layer, and a custom React backoffice wired straight to the backend. This is where the work stopped being "assigned tickets" and started being tickets I wrote myself — and production issues I was the one fixing.',
    tags: ["Angular", "React", "State Management", "BFF"],
  },
];
