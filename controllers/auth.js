import User from "../models/User.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import Currency from "../models/currency.js";
import path from "path";
import ejs from "ejs"
import nodemailer from "nodemailer"

export const signup = async(req, res) => {
  // console.log("signp")
    const {name, email, password, organization=null, role} = req.body;
    const _dirname = path.resolve() 
    if (role === "superAdmin") {
    return res.status(403).json({ error: "You cannot register as a Super Admin." });
  }
    // console.log(req.body)
    //  console.log("signp")
    if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
    
  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email is already registered." });
    }
   const defaultCurreny = await Currency.findOne({code:"USD"})
   console.log("currency: ", defaultCurreny)
    // Create new user
    const user = new User({ name, email, password, organization ,currency:defaultCurreny?._id }); // virtual setter hashes it
    await user.save();
    const templatePath = path.join(_dirname,"templates", "newUserEmail.html")
    
const htmlContent = await ejs.renderFile(templatePath, {
  userName: user.name ,
  email: user.email,
 password: user._password,
 year: new Date().getFullYear() ,
 loginLink : `${process.env.FRONTEND_URL}/login`
})

const transporter = nodemailer.createTransport({
  service:"Gmail",
  auth: {user: process.env.SENDER_EMAIL , pass: process.env.SENDER_EMAIL_PASS }
})

  await transporter.sendMail({
    to:user.email,
    subject:"Your Login Credentials",
    html:htmlContent
  })


    res.status(201).json({ message: "User registered successfully. Credentials send to Email" });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: "Server error." }, );
  }
}

export const signin = async(req, res) => {
    const {email, password} = req.body;
     try {
    // Find user
    const user = await User.findOne({ email }).populate("currency");
    if (!user || !user.authenticate(password)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Create JWT token
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "20d"
    });

    res.cookie("t", token, {
        httpOnly: true,      // JS can't access cookie (protects against XSS)
      secure: process.env.NODE_ENV === "production", // send cookie only over HTTPS in prod
      maxAge: 20 * 24 * 60 * 60 * 1000, // 20 days in milliseconds
      sameSite: "strict",  // CSRF protection
    })

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        role: user.role,
        status: user.status,
        currency: user.currency
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
}

export const signout = (req, res)=>{
  res.clearCookie("t");
  res.json({message: "signout success"});
}


export const createSuperAdmin = async (req, res) => {
  try {
    // Check if a Super Admin already exists
    const existing = await User.findOne({ role: "superAdmin" });
    if (existing) {
      return res.status(403).json({ message: "Super Admin already exists" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Use your schema's virtual password setter — it will hash automatically
    const superAdmin = new User({
      name,
      email,
      password, // triggers the virtual setter that hashes it
      role: "superAdmin",
    });

    await superAdmin.save();

    res.status(201).json({ message: "Super Admin created successfully!" });
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    res.status(500).json({ error: "Server error." });
  }
};

export const forgotPassword = async(req, res) => {
   const { email } = req.body;
   const _dirname = path.resolve()

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    const templatePath = path.join(_dirname,"templates", "otp.html")
    console.log("template path", templatePath)
      const htmlContent = await ejs.renderFile(templatePath, {
    otp,
    validity: 10,
    year:new Date().getFullYear()
  });

    // send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.SENDER_EMAIL, pass: process.env.SENDER_EMAIL_PASS },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Your Password Reset OTP",
      html: htmlContent,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
}

export const verifyOTP =  async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired OTP" });

    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};
