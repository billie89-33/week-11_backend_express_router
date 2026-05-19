const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller'); // ดึงฟังก์ชันมาจาก Controller

// 1. GET - ดึงข้อมูลสินค้าทั้งหมด
router.get('/', productController.getAllProducts);

// 2. GET - ดึงข้อมูลสินค้าเฉพาะชิ้น (ตาม ID)
router.get('/:id', productController.getProductById);

// 3. POST - เพิ่มสินค้าชิ้นใหม่
router.post('/', productController.createProduct);


router.put('/:id', productController.updateProductPut);


router.patch('/:id', productController.updateProductPatch);

// 6. DELETE - ลบสินค้าออกจากระบบ
router.delete('/:id', productController.deleteProduct);

module.exports = router;