const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
let pricingData = null; // Lưu tạm dữ liệu trên server (chỉ demo)
app.post("/api/pricing", (req, res) => {
  pricingData = req.body;
  console.log("Received pricing data:", pricingData);
  res.json({ message: "Dữ liệu đã được lưu trên server" });
});
app.get("/api/pricing", (req, res) => {
  if (pricingData) {
    res.json(pricingData);
  } else {
    res.status(404).json({ message: "Chưa có dữ liệu giá" });
  }
});
const PORT = 4000;
app.listen(PORT, () => console.log(`Server chạy trên port ${PORT}`));

