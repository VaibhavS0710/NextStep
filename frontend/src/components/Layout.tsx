import { type ReactNode } from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        © {new Date().getFullYear()} NextStep · A smart internship platform for
        students
      </footer>
    </div>
  );
};

export default Layout;
