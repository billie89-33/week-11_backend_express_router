import { Router } from "express";
import { 
  // ฟังก์ชันฝั่ง MongoDB
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  loginUser,
  
  // ฟังก์ชันฝั่ง Supabase (PostgreSQL)
  getAllPgUsers,
  createPgUser,
  updatePgUser,
  deletePgUser,
  loginPgUser
} from "../../modeles/users/users.v2.controller.js"; 

export const router = Router();




//  ส้นทาง MongoDB

router.get("/", getAllUsers);     
router.post("/", createUser);     
router.put("/:id", updateUser);   
router.delete("/:id", deleteUser); 


//login
router.post("/login", loginUser);




// เส้นทาง PostgreSQL

router.get("/pg", getAllPgUsers);     
router.post("/pg", createPgUser);     
router.put("/pg/:id", updatePgUser);   
router.delete("/pg/:id", deletePgUser); 


//login
router.post("/pg/login", loginPgUser); 