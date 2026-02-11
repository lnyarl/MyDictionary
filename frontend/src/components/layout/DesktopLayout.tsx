import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

type DesktopLayoutProps = {
  children: ReactNode;
};

export function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-18">{children}</main>
    </div>
  );
}
