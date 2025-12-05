import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AccountDetail from "./pages/AccountDetail";
import AccountForm from "./pages/AccountForm";
import ProxyManager from "./pages/ProxyManager";
import ColumnManager from "./pages/ColumnManager";
import MediaManager from "./pages/MediaManager";
import InventoryPage from "./pages/InventoryPage";
import KeyManager from "./pages/KeyManager";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import PaystubEditor from "./components/PaystubEditor";
import SettingsPage from "./pages/SettingsPage";
import Toast from "./components/Toast";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toast />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/account/:id" element={<AccountDetail />} />
          <Route path="/edit/:id" element={<AccountForm />} />
          <Route path="/proxies" element={<ProxyManager />} />
          <Route path="/columns" element={<ColumnManager />} />
          <Route path="/media" element={<MediaManager />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/keys" element={<KeyManager />} />
          <Route
            path="/category/:categoryId"
            element={<CategoryDetailPage />}
          />
          <Route path="/paystub" element={<PaystubEditor />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
