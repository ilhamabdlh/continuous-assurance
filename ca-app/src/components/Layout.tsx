import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ModalHost } from "./ModalHost";
import { Toasts } from "./Toasts";

export function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <Outlet />
      </div>
      <ModalHost />
      <Toasts />
    </div>
  );
}
