// const mongoose = require('mongoose');
import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema

const fileSchema = new mongoose.Schema({
  companyName: String,
  logo:{
    data: Buffer,
    contentType: String
  },
  fieldname: String,
  originalname: String,
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  organization: {type: ObjectId, ref: "Org"},
  createdBy: String
}, {timestamps: true});

export default mongoose.model('File', fileSchema);
