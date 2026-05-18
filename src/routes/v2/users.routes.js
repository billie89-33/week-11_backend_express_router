import { Router } from "express";
// 1 mongodb
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from "../../modeles/users/users.controller.js";


// 2. Import ฟังก์ชันฝั่ง Supabase / PostgreSQL (ไฟล์ใหม่ที่เพิ่งแยกมา)
import {
  getAllPgUsers,
  createPgUser,
  updatePgUser,
  deletePgUser
} from "../../modeles/users/users.pg.controller.js";

export const router = Router();

router.get("/", getAllUsers);     
router.post("/", createUser);     
router.put("/:id", updateUser);   
router.delete("/:id", deleteUser); 


//เวอร์ชัน (Supabase / PostgreSQL)


router.get("/pg", getAllPgUsers);     
router.post("/pg", createPgUser);     
router.put("/pg/:id", updatePgUser);   
router.delete("/pg/:id", deletePgUser); 