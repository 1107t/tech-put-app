import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/users/LoginPage";
import SignUpPage from "./pages/users/SignUpPage";
import Passreset from "./pages/users/Passreset";
import MessagePage from "./pages/users/MessagePage";

export default function App() {
  return (
    <Routes>
      {/* 最初に開いたら login へ */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* users */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset" element={<Passreset />} />

      {/* メッセージ */}
      <Route path="/message/:type" element={<MessagePage />} />

      {/* 404 */}
      <Route path="*" element={<div className="p-4">Not Found</div>} />
    </Routes>
  );
}
