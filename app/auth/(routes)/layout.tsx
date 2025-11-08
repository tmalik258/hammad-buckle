import { Header } from "@/components/layout/header";
import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
      <Header />
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center w-full pt-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
