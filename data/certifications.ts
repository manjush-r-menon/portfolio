import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from "react";

export type Certification = {
  icon: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & RefAttributes<SVGSVGElement>
  >;
  title: string;
  issuer: string;
  date: string;
  description: string;
};

export const certifications: Certification[] = [
  {
    icon: AcademicCapIcon,
    title: "Java Programming Masterclass",
    issuer: "Udemy",
    date: "July 4, 2023",
    description:
      "Mastered core Java principles and advanced application development, enabling robust solution design and efficient problem-solving in modern software development.",
  },
  {
    icon: AcademicCapIcon,
    title: "Spring Boot 3, Spring 6 & Hibernate for Beginners",
    issuer: "Udemy",
    date: "August 10, 2023",
    description:
      "Developed proficiency in building RESTful APIs and database-driven applications using Spring Boot 3's dependency injection and Hibernate ORM for streamlined Java backend development.",
  },
  {
    icon: AcademicCapIcon,
    title: "Spring Framework Masterclass",
    issuer: "Udemy",
    date: "August 18, 2023",
    description:
      "Advanced Spring Framework certification demonstrating enterprise Java development expertise in building secure, scalable applications using Spring Boot, Spring Security, and modern microservices patterns.",
  },
  {
    icon: AcademicCapIcon,
    title: "The Web Developer Bootcamp 2023",
    issuer: "Udemy",
    date: "August 26, 2023",
    description:
      "Full-stack web development certification demonstrating proficiency in modern programming paradigms, responsive design principles, and end-to-end application deployment.",
  },
  {
    icon: AcademicCapIcon,
    title: "Fundamentals of TypeScript",
    issuer: "frontendmasters",
    date: "Jan 18, 2024",
    description:
      "Acquired core competencies in type-driven development, implementing static type checking and modern ECMAScript features to build scalable JavaScript applications with enhanced maintainability and team collaboration.",
  },
  {
    icon: AcademicCapIcon,
    title: "Angular - The Complete Guide (2025 Edition)",
    issuer: "Udemy",
    date: "April 20, 2025",
    description:
      "Acquired expertise in Angular framework fundamentals and advanced features including reactive programming, component architecture, and state management for enterprise-scale web applications.",
  },
];
