import { Header } from "@/components/layout/header";
import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pb-12 pt-20">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
