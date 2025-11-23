// utils/ensureSuperAdmin.js


import User from "../models/User.js";
import Currency from "../models/currency.js";

export const ensureSuperAdmin = async () => {
    if(process.env.ALLOW_SUPERADMIN_CREATION === "true"){
    
  const existing = await User.findOne({ role: "superAdmin" });
  if (existing) return;

const defaultCurreny = await Currency.findOne({code:"USD"})
  const superAdmin = new User({
    name: process.env.SUPERADMIN_NAME || "Super Admin",
    email: process.env.SUPERADMIN_EMAIL,
    currency: defaultCurreny?._id,
    password: process.env.SUPERADMIN_PASSWORD,
    role: "superAdmin",
  });

  await superAdmin.save();
  console.log("✅ Super Admin created automatically");
} else {
    console.log("superAdmincreation is false")
}
};
