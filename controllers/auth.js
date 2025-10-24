import User from "../models/User.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";

export const signup = async(req, res) => {
  // console.log("signp")
    const {name, email, password, organization=null, role} = req.body;
    
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
  
    // Create new user
    const user = new User({ name, email, password, organization }); // virtual setter hashes it
    await user.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: "Server error." }, );
  }
}

export const signin = async(req, res) => {
    const {email, password} = req.body;
     try {
    // Find user
    const user = await User.findOne({ email });
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
        status: user.status
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