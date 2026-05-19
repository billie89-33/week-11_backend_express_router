import { Router } from "express";
import { 
  // ฟังก์ชันฝั่ง MongoDB
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  
  // ฟังก์ชันฝั่ง Supabase (PostgreSQL)
  getAllPgUsers,
  createPgUser,
  updatePgUser,
  deletePgUser
} from "../../modeles/users/users.controller.js"; 

export const router = Router();




//  รูทเส้นทางสำหรับ MongoDB

router.get("/", getAllUsers);     
router.post("/", createUser);     
router.put("/:id", updateUser);   
router.delete("/:id", deleteUser); 


// รูทเส้นทางสำหรับ Supabase (PostgreSQL)

router.get("/pg", getAllPgUsers);     
router.post("/pg", createPgUser);     
router.put("/pg/:id", updatePgUser);   
router.delete("/pg/:id", deletePgUser); 