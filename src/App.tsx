import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/users/LoginPage";
import SignUpPage from "./pages/users/SignUpPage";
import Passreset from "./pages/users/Passreset";
import MessagePage from "./pages/users/MessagePage";
import DashboardPage from "./pages/users/DashboardPage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset" element={<Passreset />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="/message/:type" element={<MessagePage />} />

      <Route path="*" element={<div className="p-4">Not Found</div>} />
    </Routes>
  );
}
