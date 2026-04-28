import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

export default function AuthLayout() {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex grow items-center justify-center px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
