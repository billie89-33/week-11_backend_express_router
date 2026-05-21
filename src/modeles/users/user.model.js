import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        email: { type: String, required: true, unique: true, lowercase: true }, // แก้ไขตรงนี้แล้ว
        password: { type: String, required: true, minlength: 8, select: false },
    },
    { timestamps: true },
);

userSchema.pre("save", async function () {
  // 1. หากรหัสผ่านไม่ได้ถูกแก้ไข ให้หยุดทำงานตรงนี้ (Mongoose จะไปขั้นตอนต่อไปเอง)
  if (!this.isModified("password")) return; 

  try {
    // 2. เข้ารหัสผ่านด้วย bcrypt พร้อมใช้คำสั่ง await 
    this.password = await bcrypt.hash(this.password, 12); 
    
    // ตรงนี้รันจบปุ๊บ ระบบจะส่งไม้ต่อเพื่อไปบันทึกลงฐานข้อมูลให้เองอัตโนมัติครับ
  } catch (err) {
    // 3. ถ้าเกิด Error ให้พ่นออกไปด้วยคำสั่ง throw
    throw err; 
  }
});


export const User = mongoose.model("User", userSchema);