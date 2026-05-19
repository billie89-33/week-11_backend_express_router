const Product = require('../modeles/products/product.model'); // ดึง Model มาใช้

// 1. GET ALL
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET BY ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "ไม่พบสินค้าชิ้นนี้" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. POST (Create)
exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. PUT (อัปเดตข้อมูลทั้งหมด)
exports.updateProductPut = async (req, res) => {
    try {
        // ต้องระบุค่าให้ครบตามโครงสร้าง ถ้าไม่ส่งฟิลด์ไหนมา ค่าเดิมจะถูกลบหรือกลายเป็นค่าว่าง
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

// 5. PATCH (อัปเดตเฉพาะบางฟิลด์)
exports.updateProductPatch = async (req, res) => {
    try {
        // ส่งมาแค่ฟิลด์ที่ต้องการแก้ เช่น { "price": 450 } ฟิลด์อื่น ๆ จะยังคงอยู่เหมือนเดิม
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

// 6. DELETE
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "ไม่พบสินค้าที่ต้องการลบ" });
        res.status(200).json({ message: "ลบข้อมูลสินค้าเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};