import { Router } from "express";
import { 
  // ฟังก์ชันฝั่ง MongoDB
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getMe,
  loginUser,
  logoutUser,
  
  // ฟังก์ชันฝั่ง Supabase (PostgreSQL)
  getAllPgUsers,
  createPgUser,
  updatePgUser,
  deletePgUser,
  loginPgUser,
  logoutPgUser
} from "../../modeles/users/users.v2.controller.js"; 

import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router();




//  ส้นทาง MongoDB

router.get("/", verifyToken, getAllUsers);     
router.post("/", createUser);     
router.put("/:id",verifyToken, updateUser);   
router.delete("/:id", verifyToken, deleteUser); 

router.get("/me", verifyToken, getMe);


//login
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);



// เส้นทาง PostgreSQL

router.get("/pg", getAllPgUsers);     
router.post("/pg", createPgUser);     
router.put("/pg/:id", updatePgUser);   
router.delete("/pg/:id", deletePgUser); 


//login
router.post("/pg/login", loginPgUser); 
router.post("/pg/logout", verifyToken, logoutPgUser);