import React, { useState, useEffect } from "react";
const API_URL = "http://localhost:4000/api/pricing";
const formatCurrency = (number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
const DB_NAME = "PricingDB";
const DB_VERSION = 1;
const STORE_NAME = "pricing";
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveData(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function getData(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export default function App() {
  const [pricing, setPricing] = useState({
    electricity: [
      { id: 1, from: 0, to: 50, price: 1500 },
      { id: 2, from: 51, to: 100, price: 2000 },
      { id: 3, from: 101, to: null, price: 2500 },
    ],
    water: [
      { id: 1, from: 0, to: 30, price: 800 },
      { id: 2, from: 31, to: 60, price: 1200 },
      { id: 3, from: 61, to: null, price: 1500 },
    ],
    serviceFeePerM2: 5000,
  });
  // Load dữ liệu từ IndexedDB
  useEffect(() => {
    getData("pricing").then((data) => {
      if (data) setPricing(data);
    });
  }, []);
  // Lưu ngay khi thay đổi
  useEffect(() => {
    saveData({ id: "pricing", ...pricing }).catch(console.error);
  }, [pricing]);
  const updatePrice = (type, index, field, value) => {
    setPricing((prev) => {
      if (type === "service") {
        return { ...prev, serviceFeePerM2: Number(value) };
      } else {
        const updatedList = prev[type].map((item, i) =>
          i === index
            ? { ...item, [field]: field === "price" || field === "to" ||

 field === "from" ? (value === "" ? null : Number(value)) : value }
            : item
        );
        return { ...prev, [type]: updatedList };
      }
    });
  };
  const syncToServer = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      if (res.ok) {
        alert("Đồng bộ dữ liệu thành công!");
      } else {
        alert("Đồng bộ thất bại.");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thiết lập bảng giá điện, nước và phí dịch vụ</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Giá điện theo bậc</h2>
        {pricing.electricity.map((item, index) => (
          <div key={item.id} className="flex gap-3 items-center mb-2">
            <span>
              {item.from} - {item.to === null ? "trở lên" : item.to} kWh:
            </span>
            <input
              type="number"
              className="border p-1 w-24"
              value={item.price}
              onChange={(e) => updatePrice("electricity", index, "price", e.target.value)}
            />
            <span>{formatCurrency(item.price)}</span>
          </div>
        ))}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Giá nước theo bậc</h2>
        {pricing.water.map((item, index) => (
          <div key={item.id} className="flex gap-3 items-center mb-2">
            <span>
              {item.from} - {item.to === null ? "trở lên" : item.to} m³:
            </span>
            <input
              type="number"
              className="border p-1 w-24"
              value={item.price}
              onChange={(e) => updatePrice("water", index, "price", e.target.value)}
            />
            <span>{formatCurrency(item.price)}</span>
          </div>
        ))}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Phí dịch vụ theo m²</h2>
        <input
          type="number"
          className="border p-1 w-32"
          value={pricing.serviceFeePerM2}
          onChange={(e) => updatePrice("service", null, null, e.target.value)}
        />
        <span className="ml-2">{formatCurrency(pricing.serviceFeePerM2)}</span>
      </section>
      <button
        onClick={syncToServer}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Đồng bộ lên server
      </button>
    </div>
  );
}

