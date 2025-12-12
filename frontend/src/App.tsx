import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Internships from "./pages/Internships";
import ChatPage from "./pages/Chat";
import ApplicationsPage from "./pages/Applications";
import NotFound from "./pages/NotFound";
import AdminScrapingPage from "./pages/AdminScraping";
import InternshipDetails from "./pages/InternshipDetails";

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "company") return <Navigate to="/company/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin/scraping" replace />;
  return <Navigate to="/internships" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/internships" element={<Internships />} />
    <Route path="/internships/:id" element={<InternshipDetails />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/applications" element={<ApplicationsPage />} />
    <Route path="/admin/scraping" element={<AdminScrapingPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
