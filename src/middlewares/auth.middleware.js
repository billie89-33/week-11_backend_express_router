import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // 🌟 ดึง token ออกมาจากคุกกี้ที่ชื่อ 'accessToken'
  const token = req.cookies.accessToken; 

  if (!token) {
    return res.status(401).json({ success: false, error: "ไม่ได้เข้าสู่ระบบ (ไม่พบ Token)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ฝังข้อมูล id/email ไว้ให้ controller ถัดไปใช้งาน
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: "Token ไม่ถูกต้องหรือหมดอายุแล้ว" });
  }
};