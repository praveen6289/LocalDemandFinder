import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import AddObservationPage from "./pages/AddObservationPage.jsx";
import AnalyzeProductPage from "./pages/AnalyzeProductPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import IntegrationStatusPage from "./pages/IntegrationStatusPage.jsx";
import ProductOpportunityPage from "./pages/ProductOpportunityPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/add-product-data" element={<AddObservationPage />} />
        <Route path="/analyze-product" element={<AnalyzeProductPage />} />
        <Route path="/integration-status" element={<IntegrationStatusPage />} />
        <Route path="/product-opportunity" element={<ProductOpportunityPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
