import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,       // name of the counter, e.g., "invoice"
    required: true
  },
  seq: {
    type: Number,
    default: 1000       // starting number, can be any number you want
  }
});

export default mongoose.model("Counter", counterSchema);
