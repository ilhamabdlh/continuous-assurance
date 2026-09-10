import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/Dashboard";
import { AssetsPage } from "./pages/Assets";
import { FindingsPage } from "./pages/Findings";
import { FindingDetailPage } from "./pages/FindingDetail";
import { RemediationPage } from "./pages/Remediation";
import { PentestPage } from "./pages/Pentest";
import {
  EvidencePage,
  ReportsPage,
} from "./pages/OtherPages";
import { PortfolioPage } from "./pages/Portfolio";
import { ComparePage } from "./pages/Compare";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="findings" element={<FindingsPage />} />
              <Route path="findings/:id" element={<FindingDetailPage />} />
              <Route path="remediation" element={<RemediationPage />} />
              <Route path="pentest" element={<PentestPage />} />
              <Route path="evidence" element={<EvidencePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
