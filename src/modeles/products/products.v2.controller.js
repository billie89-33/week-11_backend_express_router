import { Product } from './product.model.js'; 

// 1. GET ALL (แก้ไขชื่อกลับเป็น getAllProducts และใช้ export const)
export const getAllProducts = async (req, res) => { 
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET BY ID (แก้ไขเป็น export const)
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "ไม่พบสินค้าชิ้นนี้" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. POST (Create) (แก้ไขเป็น export const)
export const createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. PUT (อัปเดตข้อมูลทั้งหมด) (แก้ไขเป็น export const)
export const updateProductPut = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, overwrite: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: "ไม่พบสินค้าที่ต้องการแก้ไข" });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 5. PATCH (อัปเดตเฉพาะบางฟิลด์) (แก้ไขเป็น export const)
export const updateProductPatch = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: "ไม่พบสินค้าที่ต้องการแก้ไข" });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 6. DELETE (แก้ไขเป็น export const)
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "ไม่พบสินค้าที่ต้องการลบ" });
        res.status(200).json({ message: "ลบข้อมูลสินค้าเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};