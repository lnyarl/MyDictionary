import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageProps = {
  children: ReactNode;
  className?: ClassValue;
  maxWidth?: "2xl" | "3xl" | "4xl" | "6xl";
};

export function Page({ children, className, maxWidth = "3xl" }: PageProps) {
  const maxWidthClass = {
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
  }[maxWidth];

  return (
    <div className={cn("md:py-8 py-0", className)}>
      <div className={`${maxWidthClass} mx-auto`}>{children}</div>
    </div>
  );
}
