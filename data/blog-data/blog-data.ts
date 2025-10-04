import {
  LightBulbIcon,
  UserIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  FireIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export type Blog = {
  title: string;
  author: string;
  date: string;
  description: string;
  link: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export const blogs: Blog[] = [
  {
    title: "5 Lessons I Learned Building My First React Project",
    author: "Manjush Menon",
    date: "Oct 2025",
    description:
      "Starting my first React project was both exciting and challenging. It taught me a lot — not just about React itself, but about how to approach building apps, debugging, and growing as a developer.",
    link: "https://yourblog.com/react-lessons",
    icon: LightBulbIcon,
  },
  {
    title: "How I Manage Imposter Syndrome as a Junior Developer",
    author: "Manjush Menon",
    date: "Sep 2025",
    description: "You’re not alone — here’s how I handle self-doubt in tech.",
    link: "https://yourblog.com/imposter-syndrome",
    icon: UserIcon,
  },
  {
    title: "Lessons from My Code Reviews: Writing Clean, Readable Code",
    author: "Manjush Menon",
    date: "Aug 2025",
    description:
      "Early in my development journey, I thought good code meant clever code. But after countless code reviews—I realized something deeper: clean, readable code is what truly makes a difference.",
    link: "https://yourblog.com/code-reviews",
    icon: DocumentTextIcon,
  },
  {
    title: "From Copy-Pasting to Understanding",
    author: "Manjush Menon",
    date: "Jul 2025",
    description: "How I Stopped Being a “Tutorial Addict”",
    link: "https://yourblog.com/tutorial-addict",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: "Football and Coding: More Similar Than You Think",
    author: "Manjush Menon",
    date: "Jun 2025",
    description:
      "You’d be surprised how much coding has in common with football.",
    link: "https://yourblog.com/football-coding",
    icon: SparklesIcon,
  },
  {
    title:
      "Staying Driven Without Burning Out: A Developer's Guide to Sustainable Motivation",
    author: "Manjush Menon",
    date: "May 2025",
    description:
      "How to stay motivated and productive as a developer without burning out.",
    link: "https://yourblog.com/sustainable-motivation",
    icon: FireIcon,
  },
  {
    title: "The Importance of Asking “Why” and Staying Curious",
    author: "Manjush Menon",
    date: "Apr 2025",
    description:
      "The one question great developers ask all the time — and how it changed my mindset.",
    link: "https://yourblog.com/asking-why",
    icon: QuestionMarkCircleIcon,
  },
];
