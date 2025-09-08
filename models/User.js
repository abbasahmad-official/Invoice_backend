import mongoose, { Mongoose } from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name:{
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
     hashed_password:{
        type: String,
        required: true
    },
    role: { type: String, enum: ["admin", "user"], default: "user" }

}, {timestamps: true});

// 🔐 Virtual Field for password
userSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.hashed_password = bcrypt.hashSync(password, 10); // hash with salt rounds
  })
  .get(function () {
    return this._password;
  });

  // 🔑 Methods
  userSchema.methods = {
  authenticate: function (plaintext) {
    return bcrypt.compareSync(plaintext, this.hashed_password);
  }
};

export default mongoose.model("User", userSchema);