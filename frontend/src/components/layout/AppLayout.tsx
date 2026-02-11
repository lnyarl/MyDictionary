import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <div className="md:hidden">
          <MobileLayout>{children}</MobileLayout>
        </div>
        <div className="hidden md:block">
          <DesktopLayout>{children}</DesktopLayout>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
