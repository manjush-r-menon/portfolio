import { Container } from "@/components/container/container";
import { Button } from "../button/botton";

export default function PageUnderConstruction() {
  return (
    <Container className="flex h-full items-center">
      <div className="flex flex-col items-center">
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Under Construction
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 text-center ">
          We're working hard to bring you something amazing. Please check back
          soon!
        </p>
        <Button href="/" variant="secondary" className="mt-8">
          Go back home
        </Button>
      </div>
    </Container>
  );
}
