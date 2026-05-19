import { User } from "./user.model.js"; // สำหรับ MongoDB
import { supabase } from "../../config/supabase.js"; // สำหรับ Supabase

// คอลัมน์ที่เลือกดึงข้อมูลจากตาราง Postgres/Supabase
const PG_SELECT = "id, username, email, role, created_at, updated_at";

// ฟังก์ชันสำหรับกรองรหัสผ่านออกก่อนส่งกลับ (เฉพาะของ MongoDB)
const userResponse = (doc) => {
  const userObj = doc.toObject ? doc.toObject() : { ...doc };
  delete userObj.password;
  return userObj;
};



//  MONGODB CONTROLLERS


// 1.1 GET: ดึงข้อมูลผู้ใช้ทั้งหมดจาก MongoDB
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); 
    const cleanUsers = users.map(user => userResponse(user));
    return res.status(200).json({ success: true, data: cleanUsers });
  } catch (err) {
    next(error);
  }
};

// 1.2 POST: เพิ่มผู้ใช้ใหม่ลง MongoDB
export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "username, email and password are required" 
    });
  }
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

// 1.3 PUT: อัปเดตข้อมูลผู้ใช้ตาม ID ใน MongoDB
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: "username, email, and password are required" });
  }

  try {
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

// 1.4 DELETE: ลบข้อมูลผู้ใช้ตาม ID ใน MongoDB
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
   } catch (err) {
    next(err);
  }
};







//  SUPABASE (POSTGRESQL) CONTROLLERS


// 2.1 GET: ดึงข้อมูลผู้ใช้ทั้งหมดจาก Supabase
export const getAllPgUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(PG_SELECT);

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// 2.2 POST: เพิ่มผู้ใช้ใหม่ลง Supabase พร้อม Validation
export const createPgUser = async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "username, email and password are required" 
    });
  }
  if (password.length < 8) {
    return res.status(400).json({ 
      success: false, 
      error: "Password must be at least 8 characters long" 
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, email, password, role: role || "user" }])
      .select(PG_SELECT)
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({ success: false, error: "Email already exists" });
      }
      throw error;
    }
    return res.status(201).json({ success: true, data });
  } catch (err) {
     next(err)
  }
};

// 2.3 PUT: อัปเดตข้อมูลผู้ใช้ใน Supabase พร้อม Validation
export const updatePgUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "username, email, and password are required" 
    });
  }
  if (password && password.length < 8) {
    return res.status(400).json({ 
      success: false, 
      error: "Password must be at least 8 characters long" 
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ username, email, password })
      .eq("id", id)
      .select(PG_SELECT)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      if (error.code === "23505") {
        return res.status(400).json({ success: false, error: "Email already exists" });
      }
      throw error;
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// 2.4 DELETE: ลบข้อมูลผู้ใช้ตาม ID ใน Supabase
export const deletePgUser = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      throw error;
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};