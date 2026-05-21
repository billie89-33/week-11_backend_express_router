import { User } from "./user.model.js"; // สำหรับ MongoDB
import { supabase } from "../../config/supabase.js"; // สำหรับ Supabase
import jwt from "jsonwebtoken";
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
     // 🌟 เพิ่ม Logic เช็กสิทธิ์ ต้องเป็นแอดมิน 
     if (req.user.role !== "admin" && req.user.userId !== id) {
      return res.status(403).json({ success: false, error: "คุณไม่มีสิทธิ์แก้ไขข้อมูลของผู้อื่น" });
    }



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

    // 🌟 เพิ่ม Logic เช็กสิทธิ์ ต้องเป็นแอดมิน 
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "เฉพาะแอดมินเท่านั้นที่มีสิทธิ์ลบผู้ใช้" });
    }


    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err); 
  }
};



export const getMe = async (req, res, next) => {
  try {
    // 🌟 ดึงข้อมูลจากฐานข้อมูลขึ้นมาใหม่ เพื่อเอาข้อมูลที่อัปเดตล่าสุด (และกรองเอา password ออก)
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "ไม่พบข้อมูลผู้ใช้งาน" });
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ใช้ปัจจุบันฝั่ง MongoDB สำเร็จ!",
      data: userResponse(user) // ส่งข้อมูลที่ไม่มี password กลับไปให้ Frontend
    });
  } catch (err) {
    next(err);
  }
};


//  LOGIN CONTROLLER (สำหรับ MongoDB)


export const loginUser = async (req, res, next) => {
  const { email, password } = req.body || {};

  // 1. ตรวจสอบว่าส่งอีเมลและรหัสผ่านเข้ามาไหม
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  try {
    // 2. ค้นหาผู้ใช้ในฐานข้อมูล MongoDB โดยดึงฟิลด์ password ออกมาเทียบด้วย
    const user = await User.findOne({ email }).select("+password");
    
    // ถ้าไม่พบผู้ใช้งานอีเมลนี้ในระบบ
    if (!user) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 3. ตรวจสอบรหัสผ่านด้วย bcrypt
    const isMatched = await bcrypt.compare(password, user.password);
    
    // ถ้ารหัสผ่านไม่ถูกต้อง
    if (!isMatched) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 4. สร้าง JWT Token (ดึงค่าบทบาท role มาร่วมฝังเพื่อเอาไว้เช็กสิทธิ์แอดมินด้วย)
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "1m" } // ⏱️ ปรับเป็น 1 นาทีสำหรับใช้ทดสอบระบบหมดอายุตามต้องการ
    );

    // 5. เช็กสถานะสภาวะแวดล้อมเพื่อความยืดหยุ่นตอน Deploy
    const isProd = process.env.NODE_ENV === "production";

    // 6. ส่ง HTTP-Only Cookie ไปฝังที่ตัว Client
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 1 * 60 * 1000 // ⏱️ ตั้งหมดอายุ 1 นาทีบนคุกกี้ให้สัมพันธ์กัน
    });

    // 7. ส่ง Response สำเร็จกลับไป (ตัวแปร user มีตัวตนร้อยเปอร์เซ็นต์แล้ว)
    return res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบฝั่ง MongoDB สำเร็จด้วยระบบคุกกี้!",
      data: userResponse(user) 
    });

  } catch (error) {
    next(error);
  }
};

// LOGOUT CONTROLLER 
export const logoutUser = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    // 🌟 สั่งเคลียร์คุกกี้ชื่อ accessToken ทิ้งทันที (ตั้งค่าออปชันให้ตรงกับตอนสร้าง)
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/"
    });

    return res.status(200).json({ 
      success: true, 
      message: "ออกจากระบบฝั่ง MongoDB สำเร็จ!" 
    });
    
  } catch (err) {
    next(err);
  }
};

// ==========================================


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
    
    // 🌟 ปรับปรุง: ดึงเอาออบเจกต์ผู้ใช้ตัวแรกออกจากอาเรย์ดึงมาแสดงผลสวยๆ
    return res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    // 🌟 ปรับปรุงจุดบกพร่อง: ดักสกัด Error 23505 (Unique Violation) เพื่อส่งสิทธิ์ 400 กลับไปสวยๆ ไม่หลุดพังเป็น 500
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้วฝั่ง Postgres" });
    }
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





// LOGIN LOGOUT  PostgreSQL

export const loginPgUser = async (req, res, next) => {
  const { email, password } = req.body || {};

  // 1. ตรวจสอบค่าว่างเบื้องต้น
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  try {
    // ค้นหาผู้ใช้จากอีเมลในตาราง users บน Supabase
    const { data: userArray, error } = await supabase
      .from("users")
      .select(`id, username, email, role, password, created_at, updated_at`) 
      .eq("email", email);

    if (error) throw error;

    // ถ้าไม่พบผู้ใช้อีเมลนี้ในระบบ
    if (!userArray || userArray.length === 0) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = userArray[0]; 

    // เปรียบเทียบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    delete user.password;

    // 🌟 🔥 2. เพิ่มท่อนสร้าง JWT Token (คุณทำตกหล่นไปตรงนี้)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "1m" } // ⏱️ หมดอายุ 1 นาทีสำหรับใช้เทส
    );

    const isProd = process.env.NODE_ENV === "production";

    // 🌟 🔥 3. เพิ่มท่อนสั่งยิงคุกกี้ส่งกลับไปฝังที่เบราว์เซอร์ Client
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 1 * 60 * 1000 // ⏱️ อายุคุกกี้ 1 นาทีสัมพันธ์กับ Token
    });

    // 4. ส่ง Response กลับไปพร้อมข้อความที่อัปเดตใหม่
    return res.status(200).json({ 
      success: true, 
      message: "เข้าสู่ระบบฝั่ง Postgres สำเร็จด้วยระบบคุกกี้!", // เปลี่ยนข้อความให้สังเกตง่าย
      data: user 
    });

  } catch (err) {
    next(err); 
  }
};


export const logoutPgUser = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    // 🌟 สั่งล้างคุกกี้ที่ชื่อ accessToken ทิ้งจากเบราว์เซอร์ Client
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/"
    });

    return res.status(200).json({ 
      success: true, 
      message: "ออกจากระบบฝั่ง Postgres สำเร็จ!" 
    });
    
  } catch (err) {
    next(err);
  }
};