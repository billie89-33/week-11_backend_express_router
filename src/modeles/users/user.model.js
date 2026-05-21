import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        email: { type: String, required: true, unique: true, lowercase: true }, // แก้ไขตรงนี้แล้ว
        password: { type: String, required: true, minlength: 8, select: false },
    },
    { timestamps: true },
);

userSchema.pre("save", async function (next) {
  
  if (!this.isModified("password")) return next(); 

  try {
    
    this.password = await bcrypt.hash(this.password, 12); 
    next();
  } catch (err) {
    next(err);
  }
});



export const User = mongoose.model("User", userSchema);