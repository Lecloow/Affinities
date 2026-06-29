import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Leaderboard from "./pages/leaderboard";
import { Documentation } from "@/components";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/admin-panel" element={<Documentation />} />
    </Routes>
  );
}
