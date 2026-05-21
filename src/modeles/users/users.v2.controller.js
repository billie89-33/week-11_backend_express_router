import { User } from "./user.model.js"; // สำหรับ MongoDB
import { supabase } from "../../config/supabase.js"; // สำหรับ Supabase
import bcrypt from "bcrypt"; 

// คอลัมน์ที่เลือกดึงข้อมูลจากตาราง Postgres/Supabase
const PG_SELECT = "id, username, email, role, created_at, updated_at";

// ฟังก์ชันสำหรับกรองรหัสผ่านออกก่อนส่งกลับ (เฉพาะของ MongoDB)
const userResponse = (doc) => {
  const userObj = doc.toObject ? doc.toObject() : { ...doc };
  delete userObj.password;
  return userObj;
};


//  MONGODB CONTROLLERS

export const getAllUsers = async (req, res, next) => { 
  try {
    const users = await User.find(); 
    const cleanUsers = users.map(user => userResponse(user));
    return res.status(200).json({ success: true, data: cleanUsers });
  } catch (err) {
    next(err); 
  }
};


export const createUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: "username, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters long" });
  }

  try {
    const userExists = await User.findOne({ email }); 
    if (userExists) {
      return res.status(400).json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    

     const doc = await User.create({ username, email, password, role });
     
    return res.status(201).json({ 
       success: true,
       message: "สมัครสมาชิกสำเร็จ!",
       data: userResponse(doc) 
      });
  } catch (err) {
    next(err); 
  }
};


export const updateUser = async (req, res, next) => { 
  const { id } = req.params;
  const { username, email, password } = req.body || {};

  try {
    const updateData = { username, email };
    
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: "Password must be at least 8 characters long" });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.status(200).json({ success: true, data: userResponse(updatedUser) });
  } catch (err) {
    next(err);
  }
};


export const deleteUser = async (req, res, next) => { 
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


//  LOGIN CONTROLLER (สำหรับ MongoDB)

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body || {};

 
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  try {
   
    const user = await User.findOne({ email }).select("+password");
    
    
    if (!user) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    
    const isMatched = await bcrypt.compare(password, user.password);
    
    
    if (!isMatched) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

   
    return res.status(200).json({ 
      success: true, 
      message: "เข้าสู่ระบบสำเร็จ!",
      data: userResponse(user) 
    });

  } catch (err) {
    next(err); 
  }
};





//  SUPABASE (POSTGRESQL) CONTROLLERS



export const getAllPgUsers = async (req, res, next) => { // เพิ่ม next เข้ามาที่พารามิเตอร์
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);
    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err); // เปลี่ยนเป็น next(err) แทน 500 เดิมเรียบร้อยครับ
  }
};


export const createPgUser = async (req, res, next) => { 
  const { username, email, password, role } = req.body || {};
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, email, password: hashedPassword, role }])
      .select(PG_SELECT);

    if (error) throw error;
    return res.status(201).json({ success: true, data: data });
  } catch (err) {
    next(err); 
  }
};


export const updatePgUser = async (req, res, next) => { 
  const { id } = req.params;
  const { username, email, role } = req.body || {};
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ username, email, role })
      .eq("id", id)
      .select(PG_SELECT);

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ success: false, error: "User not found" });
    return res.status(200).json({ success: true, data: data });
  } catch (err) {
    next(err); 
  }
};


export const deletePgUser = async (req, res, next) => { 
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from("users").delete().eq("id", id).select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ success: false, error: "User not found" });
    return res.status(200).json({ success: true, message: "User deleted successfully from Postgres" });
  } catch (err) {
    next(err); 
  }
};





// LOGIN  PostgreSQL

export const loginPgUser = async (req, res, next) => {
  const { email, password } = req.body || {};

  // 1. ตรวจสอบค่าว่างเบื้องต้น
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  try {
    //  ค้นหาผู้ใช้จากอีเมลในตาราง users บน Supabase (รอบนี้ต้องเลือกเอาฟิลด์ password มาด้วยเพื่อเทียบค่า)
    const { data: userArray, error } = await supabase
      .from("users")
      .select(`id, username, email, role, password, created_at, updated_at`) // ดึงฟิลด์ทั้งหมดรวมถึง password
      .eq("email", email);

    if (error) throw error;

    // ถ้าไม่พบผู้ใช้อีเมลนี้ในระบบ (อาเรย์ว่างเปล่า)
    if (!userArray || userArray.length === 0) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = userArray[0]; // ดึงข้อมูลผู้ใช้ออกมาจากกล่องอาเรย์แถวแรก

    // bcrypt.compare เปรียบเทียบรหัสผ่านธรรมดากับรหัสลับในระบบ
    const isMatch = await bcrypt.compare(password, user.password);
    
    // ถ้ารหัสไม่ตรงกัน
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

  
    delete user.password;

    return res.status(200).json({ 
      success: true, 
      message: "เข้าสู่ระบบฝั่ง Postgres สำเร็จ!",
      data: user 
    });

  } catch (err) {
    next(err); 
  }
};