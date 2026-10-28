import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="min-h-full bg-slate-50">
      <NavBar />
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}
