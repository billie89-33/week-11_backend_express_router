import { Router } from "express";
// เปลี่ยนชื่อตอนนำเข้าเพื่อไม่ให้ซ้ำกับตัวแปรที่ใช้จัดการจริง
import fakeUsersList from "../../fakeData/fakeUser.js";

export const router = Router();

// คัดลอกข้อมูลออกมาเป็น Local Array เพื่อให้สามารถทำ CRUD (Push, Edit, Splice) ได้
let users = [...fakeUsersList];

// 1. GET: ดึงข้อมูลผู้ใช้ทั้งหมด
router.get("/", (req, res) => {
    res.json(users);
});

// 2. POST: เพิ่มผู้ใช้ใหม่
router.post("/", (req, res) => {
    const { username, email } = req.body || {};

    if (!username || !email) {
        return res.status(400).json({ error: "username and email are required" });
    }

    const nextId = String(
        (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
    );

    const newUser = { id: nextId, username: username, email: email };
    users.push(newUser);

    return res.status(201).json(newUser);
});

// 3. PUT: อัปเดตข้อมูลผู้ใช้ตาม ID
router.put("/:id", (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { username, email, password } = req.body || {};

    // ตรวจสอบเงื่อนไขข้อมูลที่จำเป็นต้องส่งมาให้ครบ
    if (!username || !email || !password) {
        return res.status(400).json({ error: "username, email, and password are required" });
    }

    user.username = username;
    user.email = email;
    user.password = password;

    res.status(200).json(user);
});

// 4. DELETE: ลบข้อมูลผู้ใช้ตาม ID
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    // ลบข้อมูลออกจาก Array
    users.splice(index, 1);

    return res.status(200).json({ message: "User deleted successfully" });
});