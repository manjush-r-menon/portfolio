"use client";

import { AcademicCapIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ExperienceRoadmap() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const experiences = [
    {
      title: "10th Grade",
      year: "2014-2016",
      description: "Mahatma Gandhi Public School, Chottanikkara",
      side: "right",
      type: "education",
    },
    {
      title: "12th Grade",
      year: "2016-2018",
      description: "Mahatma Gandhi Public School, Chottanikkara",
      side: "left",
      type: "education",
    },
    {
      title: "Btech in Computer Science and Engineering",
      year: "2018-2022",
      description:
        "Sree Narayana Gurukulam College of Engineering, Kadayirippu",
      side: "right",
      type: "education",
    },
    {
      title: "Sutherland",
      year: "2022-2023",
      description: "Associate Customer Support",
      side: "left",
      type: "work",
    },
    {
      title: "Mindcurv",
      year: "2023-2025",
      description: "Associate Developer",
      side: "right",
      type: "work",
    },
    {
      title: "Accenture Song",
      year: "2025-Present",
      description: "Packaged App Development Analyst",
      side: "left",
      type: "work",
    },
  ];

  return (
    <section className="relative py-4 mt-16" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl mb-16">
          Journey
        </h2>

        <div className="absolute left-1/2 w-1 h-11/12 bg-zinc-200 dark:bg-zinc-700  hidden sm:block" />

        <div className="relative space-y-40  hidden sm:block">
          {experiences.map((experience, index) => (
            <motion.div
              key={index}
              className={`relative flex mb-2 ${
                experience.side === "left" ? "justify-start" : "justify-end"
              }`}
              initial={{
                opacity: 0,
                x: experience.side === "left" ? -100 : 100,
              }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-150px" }}
              transition={{ duration: 0.5 }}
            >
              <div
                className={`group flex flex-col rounded-2xl p-6 transition-all bg-zinc-50 dark:bg-zinc-800/50 ${
                  experience.side === "left" ? "ml-8" : "mr-8"
                } w-full max-w-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                    {experience.type === "education" ? (
                      <AcademicCapIcon className="h-6 w-6 text-zinc-700 transition-colors duration-300 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
                    ) : (
                      <BriefcaseIcon className="h-6 w-6 text-zinc-700 transition-colors duration-300 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
                    )}
                  </div>

                  {/* Content container */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl font-semibold text-zinc-800 transition-colors duration-300 dark:text-zinc-200 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                        {experience.title}
                      </h3>
                      <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                        {experience.year}
                      </span>
                    </div>

                    <p className="mt-2 w-full text-zinc-600 transition-colors duration-300 dark:text-zinc-400 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                      {experience.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative space-y-40  block sm:hidden">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className={`group flex flex-col rounded-2xl p-6 transition-all bg-zinc-50 dark:bg-zinc-800/50 w-full max-w-md mb-12`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                  {experience.type === "education" ? (
                    <AcademicCapIcon className="h-6 w-6 text-zinc-700 transition-colors duration-300 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
                  ) : (
                    <BriefcaseIcon className="h-6 w-6 text-zinc-700 transition-colors duration-300 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-zinc-800 transition-colors duration-300 dark:text-zinc-200 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                      {experience.title}
                    </h3>
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      {experience.year}
                    </span>
                  </div>

                  <p className="mt-2 w-full text-zinc-600 transition-colors duration-300 dark:text-zinc-400 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                    {experience.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
