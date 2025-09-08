import mongoose from "mongoose";
import Counter from "./Counter.js";
const { ObjectId } = mongoose.Schema;

const invoiceSchema = new mongoose.Schema({
      invoiceNumber: {
    type: Number,
    unique: true          // make sure it's unique
  },
    client: {
        type: ObjectId,
        ref: "Client",
        required: true
    },
    items: [
        { productId:{
            type:ObjectId,
            ref: "Product",
            required: true
        }, 
        quantity: Number,
    price: Number
    }
    ],
    tax: Number,
    discount: Number,
    totalAmount: Number,
    dueDate: Date,
    status: { type: String, enum: ["Paid", "Pending", "Overdue"], default: "Pending" },
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: null },
    startDate: Date,
    endDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }

}, { timestamps: true });

// Pre-save middleware to auto-increment invoiceNumber
invoiceSchema.pre("save", async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "invoice" },           // counter document id
        { $inc: { seq: 1 } },         // increment seq by 1
        { new: true, upsert: true }   // create doc if not exists, return updated doc
      );

      this.invoiceNumber = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model("Invoice", invoiceSchema);