import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ModalHost } from "./ModalHost";
import { Toasts } from "./Toasts";

export function Layout() {
  const { isAuthenticated } = useAuth();
  const { ready } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!ready) {
    return (
      <div className="app-loading">
        <div>Loading Continuous Assurance store…</div>
      </div>
    );
  }

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
