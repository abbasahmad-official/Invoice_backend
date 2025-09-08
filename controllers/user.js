import User from "../models/User.js";

export const listCount = async(req,res) => {
    try{
        const count = await User.countDocuments();
        res.status(200).json({count});
    }catch(error){
        res.status(400).json({error: error.message})
    }
}