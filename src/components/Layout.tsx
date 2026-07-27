import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

interface LayoutProps {
  children: ReactNode;
  search?: string;
  onSearchChange?: (v: string) => void;
}

const Layout = ({ children, search, onSearchChange }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar search={search} onSearchChange={onSearchChange} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
