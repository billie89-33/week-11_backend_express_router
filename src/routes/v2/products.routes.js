import { Router } from "express";
// 1. ดึงฟังก์ชันมารายตัวเหมือนฝั่ง User
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProductPut, 
    updateProductPatch, 
    deleteProduct 
} from '../../modeles/products/products.v2.controller.js'; 

export const router = Router();


router.get("/", getAllProducts);        // ดึงสินค้าทั้งหมด
router.get("/:id", getProductById);    // ดึงสินค้าตาม ID
router.post("/", createProduct);       // เพิ่มสินค้าใหม่
router.put("/:id", updateProductPut);   // อัปเดตสินค้าทั้งหมด (PUT)
router.patch("/:id", updateProductPatch); // อัปเดตบางฟิลด์ (PATCH)
router.delete("/:id", deleteProduct); 