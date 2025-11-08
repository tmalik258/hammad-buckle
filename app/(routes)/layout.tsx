import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col mx-auto">
      <Header />
      <main className="flex-1 -mt-16 max-md:pt-20">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
