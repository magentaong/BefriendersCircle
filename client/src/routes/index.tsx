import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Resources from "../pages/Resources";
import Forum from "../pages/Forum";

export default function AppRoutes() {
    console.log("routes loaded!");
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/forum" element={<Forum />} />
      {/* Add more routes here */}
    </Routes>
  );
}
