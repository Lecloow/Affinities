import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<Home/>} />
      </Routes>
  );
}