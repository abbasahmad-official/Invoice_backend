import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const orgSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 40
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    plan:{
        type:String,
         enum:["Free", "Pro"],
          required: true,
          default:"Free"
    },
      templateName:{type:String, default:"invoice-template.html"},
  usage: {
    invoicesCreated: { type: Number, default: 0 },
    customersCreated: { type: Number, default: 0 },
    emailsSent: { type: Number, default: 0 },
  },
    currency: { type: ObjectId, ref: "Currency" },
    status: {
        type: String, enum: ["active", "suspended"], default: "active"
    },
    createdBy: { type: ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Org", orgSchema);
