import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import TutorialsPage from "./pages/TutorialsPage";
import TutorialDetailPage from "./pages/TutorialDetailPage";
import FeedbackPage from "./pages/FeedbackPage";
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import PhoneRepairPage from "./pages/PhoneRepairPage";
import AppleiPhonePage from "./pages/AppleiPhonePage";
import AndroidPhonePage from "./pages/AndroidPhonePage";
import ModelRepairPage from "./pages/ModelRepairPage";
import LaptopRepairPage from "./pages/LaptopRepairPage";
import LaptopBrandPage from "./pages/LaptopBrandPage";
import MoreDevicesPage from "./pages/MoreDevicesPage";

const App = () => (
  <div className="bg-[#f9fafe] min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Hierarchical Device Navigation */}
        <Route path="/device/phone" element={<PhoneRepairPage />} />
        <Route path="/device/phone/apple-iphone" element={<AppleiPhonePage />} />
        <Route path="/device/phone/apple-iphone/:model" element={<ModelRepairPage />} />
        <Route path="/device/phone/android" element={<AndroidPhonePage />} />
        <Route path="/device/phone/android/:model" element={<ModelRepairPage />} />
        <Route path="/device/laptop" element={<LaptopRepairPage />} />
        <Route path="/device/laptop/:brand" element={<LaptopBrandPage />} />
        <Route path="/device/laptop/:brand/:model" element={<ModelRepairPage />} />
        <Route path="/device/more" element={<MoreDevicesPage />} />
        {/* Legacy Tutorial Routes */}
        <Route path="/tutorials" element={<TutorialsPage />} />
        <Route path="/tutorials/:id" element={<TutorialDetailPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/creator-dashboard" element={<CreatorDashboardPage />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;


