// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import AuthIntro from "./pages/auth/AuthIntro";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<AuthIntro />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* App */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Páginas extras (mantive as duas rotas para não quebrar nada) */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/perfil" element={<Profile />} />

      <Route path="/settings" element={<Settings />} />
      <Route path="/configuracoes" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
