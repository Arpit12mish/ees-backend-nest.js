"use client";

import { ErrorState } from "@/components/common/ErrorState";
import { Container } from "@/components/common/Container";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-16">
      <div className="space-y-4">
        <ErrorState
          title="Something went wrong"
          description="We could not load this page. Please try again."
        />
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full bg-[var(--foreground)] px-5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </Container>
  );
}
