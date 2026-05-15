import mongoose from "mongoose";
import users from "../../fakeData/fakeUser";


const userSchema = new mongoose.Schema(
    {
        username: {type: String, required: true, trim: true },
        role: {type: String, enum: ["user", "admin"], default:  "user" },
        email: {type: String, reqired: true, unique: true, lowercase: true },
        password: {type: String, required: true, minlength: 8, select: false },
    }
    {timestamps: true },
);


export const User = mongoose.model("user", userSchema);