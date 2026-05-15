import { User } from "./user.model.js";

// ฟังก์ชันสำหรับกรองรหัสผ่านออกก่อนส่งกลับ
const userResponse = (doc) => {
  const userObj = doc.toObject ? doc.toObject() : { ...doc };
  delete userObj.password;
  return userObj;
};


// 1. GET: ดึงข้อมูลผู้ใช้ทั้งหมดจาก MongoDB
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // ดึงข้อมูลทุกตัวจากฐานข้อมูล
    // กรองรหัสผ่านออกทุกตัวก่อนส่งกลับเพื่อความปลอดภัย
    const cleanUsers = users.map(user => userResponse(user));
    return res.status(200).json({ success: true, data: cleanUsers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


// 2. POST: เพิ่มผู้ใช้ใหม่
export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "username, email and password are required" 
    });
  }

  // เพิ่ม Validation เช็กความยาวรหัสผ่านตามที่อยากได้
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters long" });
  }

  try {
    const doc = await User.create({ username, email, password, role });
    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};


// 3. PUT: อัปเดตข้อมูลผู้ใช้ตาม ID ใน MongoDB
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: "username, email, and password are required" });
  }

  try {
    // อัปเดตข้อมูลและดึงค่าใหม่ที่อัปเดตแล้วกลับมา ({ new: true })
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: userResponse(updatedUser) });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};


// 4. DELETE: ลบข้อมูลผู้ใช้ตาม ID ใน MongoDB
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};