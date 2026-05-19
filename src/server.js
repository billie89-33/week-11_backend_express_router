import express from "express"
import users from "./fakeData/fakeUser.js"
import { router as apiRoutes } from "./routes/index.js";
import { connectDB } from "./config/mongodb.js";
import cors from "cors";
import { connectSupabase } from './config/supabase.js';

const app = express();

app.use(cors())

app.use(express.json());




// เปลี่ยนจากเรียกใช้ดื้อๆ มาเป็นฟังก์ชัน startServer
async function startServer() {
  try {

    await connectDB();
    await connectSupabase();


    app.use("/api", apiRoutes);


    // centralized error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);

      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error!",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        stack: err.stack
      });
    });


    const PORT = 4001;
    app.listen(PORT, () => {
      console.log(`Server running on Port: ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // ปิดโปรแกรมทันทีหากเชื่อมต่อฐานข้อมูลหลักไม่สำเร็จ
  }
}

// สั่งให้ฟังก์ชันเริ่มทำงาน
startServer();



