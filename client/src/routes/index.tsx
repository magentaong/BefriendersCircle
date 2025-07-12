import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Resources from "../pages/Resources";
import Forum from "../pages/Forum";
import Training from "../pages/Training";
import HomeSafety from "../pages/HomeSafety";

export default function AppRoutes() {
    console.log("routes loaded!");
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/training" element={<Training />} />
      <Route path="/training/home-safety" element={<HomeSafety />} />


      {/* Add more routes here */}
    </Routes>
  );
}
