import React from "react";
import Breadcrumb from "../components/Breadcrumb";

const MoreDevicesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: "Device", to: "/" },
        { label: "More Devices" }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">More Devices</h1>
        <p className="text-neutral-600">
          Additional device categories (Tablets, Consoles, Accessories) will be available soon.
        </p>
      </div>
    </div>
  );
};

export default MoreDevicesPage;

