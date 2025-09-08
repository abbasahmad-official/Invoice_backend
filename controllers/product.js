import Product from "../models/Product.js";


// create product
export const create = async(req, res) => {
    try{
        const product = new Product(req.body);
        await product.save();
        res.status(200).json(product);
    }catch(error){
        res.status(400).json({error: error.message})
    }
}

// get all products
export const list = async(req,res) => {
    try{

        const products = await Product.find({});
        res.status(200).json(products);
    }catch(error){
        res.status(400).json({error: error.message})
    }
}

export const listProduct = async(req,res) => {
    try{
        const userId = req.params.userId;
        const products = await Product.find({createdBy:userId});
        res.status(200).json(products);
    }catch(error){
        res.status(400).json({error: error.message})
    }
}

// get single product
export const read = async(req, res) => {
    try{
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        res.status(200).json(product);
    }catch(error){
        res.status(404).json({error: "product not found"});
    }
}

// update product
export const update = async(req, res) => {
    try{
        const productId = req.params.productId
        const updated = await Product.findByIdAndUpdate(productId, req.body, {new:true});
        res.status(200).json(updated);
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

// delete product
export const remove = async(req, res) => {
    try{
        const productId = req.params.productId;
        const updated = await Product.findByIdAndDelete(productId);
        res.status(200).json({message: "product deleted"});
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

// list search by name description
export const listSearch = async (req, res) => {
  try {
    const query = {};

    // If a search term is provided, search in name OR description
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query);

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error fetching products' });
  }
};
