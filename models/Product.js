import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        trim: true
    },
    organization:{type: ObjectId, ref:"Org"},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }

}, { timestamps: true });

export default mongoose.model("Product", productSchema);