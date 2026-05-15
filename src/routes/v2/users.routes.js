import { Router } from "express";
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from "../../modeles/users/users.controller.js";

export const router = Router();

router.get("/", getAllUsers);     
router.post("/", createUser);     
router.put("/:id", updateUser);   
router.delete("/:id", deleteUser); 