// Progresql
import { supabase } from "../../config/supabase.js";

const PG_SELECT = "id, username, email, role, created_at, updated_at";

// 1. GET: ดึงข้อมูลผู้ใช้ทั้งหมดจาก Supabase
export const getAllPgUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(PG_SELECT);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 2. POST: เพิ่มผู้ใช้ใหม่ลง Supabase พร้อม Validation
export const createPgUser = async (req, res) => {
  const { username, email, password, role } = req.body || {};

  // Validation: เช็กค่าว่าง
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "username, email and password are required" 
    });
  }

  // Validation: เช็กความยาวรหัสผ่าน
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
    return res.status(400).json({ success: false, error: err.message });
  }
};

// 3. PUT: อัปเดตข้อมูลผู้ใช้ใน Supabase พร้อม Validation
export const updatePgUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body || {};

  // Validation: เช็กค่าว่าง
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "username, email, and password are required" 
    });
  }

  // Validation: เช็กความยาวรหัสผ่านกรณีมีการเปลี่ยน
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
    return res.status(400).json({ success: false, error: err.message });
  }
};

// 4. DELETE: ลบข้อมูลผู้ใช้ตาม ID ใน Supabase
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
    return res.status(400).json({ success: false, error: err.message });
  }
};