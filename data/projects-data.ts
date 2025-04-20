export type projectsType = {
  title: string;
  role: string;
  description: string;
  tech: string[];
};

export const projects: projectsType[] = [
  {
    title: "ArtConnect E-Commerce Platform",
    role: "Full Stack Developer & Business Analyst",
    description:
      "Orchestrated end-to-end development of artist-centric marketplace from requirements gathering to deployment. Conducted stakeholder interviews and created functional specifications as BA, then implemented core features including real-time inventory updates and purchase workflows. Established automated testing suite covering 85% of critical paths using Selenium.",
    tech: ["React", "Java", "Spring Boot", "H2 Database", "Selenium", "JIRA"],
  },
  {
    title: "Morent Car Renting App",
    role: "Frontend Developer",
    description:
      "Created a responsive car rental interface focusing on UI/UX best practices, implementing complex component interactions and state management. Developed as training exercise to master Next.js fundamentals and modern frontend patterns.",
    tech: ["Next.js", "Tailwind"],
  },
  {
    title: "B2X E-Commerce Platform",
    role: "Frontend Developer",
    description:
      "Developed core features using React in a monorepo environment. Built reusable components with Storybook documentation and interaction testing. Worked within Dev Container setup to maintain consistent development workflows across teams.",
    tech: [
      "React",
      "Storybook",
      "Testing Library",
      "Tailwind CSS",
      "Dev Containers",
      "TypeScript",
      "Jest",
    ],
  },
  {
    title: "BASF E-Commerce Platform",
    role: "Frontend Developer (Angular & React)",
    description:
      "Developing a robust e-commerce platform comprising a backoffice application using React and a customer-facing shop using Angular. Focused on building clean, reusable components and maintaining high code quality with unit and integration tests, achieving over 80% test coverage across the application.",
    tech: [
      "Angular",
      "React",
      "Commerce Tools",
      "TypeScript",
      "Jest",
      "Commerce Tools UI Kit",
    ],
  },
  {
    title: "Portfolio Website",
    role: "Frontend Developer",
    description:
      "Designed and developed a personal portfolio website to showcase projects and skills, utilizing NextJs and Tailwind CSS for responsive design and optimal performance.",
    tech: ["NextJs", "Tailwind"],
  },
];
