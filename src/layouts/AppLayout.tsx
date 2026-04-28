import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

export default function AppLayout() {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="grow px-4 py-6 md:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
