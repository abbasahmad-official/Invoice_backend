// utils/ensureSuperAdmin.js
import User from "../models/User.js";

export const ensureSuperAdmin = async () => {
    if(process.env.ALLOW_SUPERADMIN_CREATION === "true"){
    
  const existing = await User.findOne({ role: "superAdmin" });
  if (existing) return;

  const superAdmin = new User({
    name: process.env.SUPERADMIN_NAME || "Super Admin",
    email: process.env.SUPERADMIN_EMAIL,
    password: process.env.SUPERADMIN_PASSWORD,
    role: "superAdmin",
  });

  await superAdmin.save();
  console.log("✅ Super Admin created automatically");
} else {
    console.log("superAdmincreation is false")
}
};
