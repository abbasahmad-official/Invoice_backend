import Org from "../models/Org.js";
import Client from "../models/Client.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import Currency from "../models/currency.js"
import File from "../models/File.js";
import Product from "../models/Product.js"
import fs from "fs"
import path from "path"
import ejs from "ejs"
import nodemailer from "nodemailer"
import { error } from "console";


export const create = async (req, res) => {

  try {
    const { newPassword, ...safeOrg } = req.body;

    // Save org first
    const org = new Org(safeOrg);
    // await org.save({ session });
if(!org.name || !org.email || !org._id || !newPassword || !org.plan){
  res.status(400).json({error:"Missing fields. All fields required"})
  return
}
    // Find default currency
    const defaultCurrency = await Currency.findOne({ code: "USD" })
    if (!defaultCurrency) {
      throw new Error("Default currency USD not found");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: org.email })
    if (existingUser) {
      throw new Error("This User already exists. Duplication error");
    }

    // Create admin user
    const user = new User({
      name: org.name,
      email: org.email,
      organization: org._id,
      role: "admin",
      password: newPassword,
      currency: defaultCurrency._id,
    });
    // send mail
    // const _dirname = path.resolve()

    //  const templatePath = path.join(_dirname,"templates", "newUserEmail.html")
    //  const htmlContent = await ejs.renderFile(templatePath, {
    //    userName: user.name ,
    //    email: user.email,
    //   password: user._password,
    //   year: new Date().getFullYear() ,
    //   loginLink : `${process.env.FRONTEND_URL}/login`
    //  })

    //  const transporter = nodemailer.createTransport({
    //    service:"Gmail",
    //    auth: {user: process.env.SENDER_EMAIL , pass: process.env.SENDER_EMAIL_PASS }
    //  })
     
    //    await transporter.sendMail({
    //      to:user.email,
    //      subject:"Your Login Credentials",
    //      html:htmlContent
    //    })
await user.save();
 await org.save()

      //  success reply
    res.status(200).json({message:"Organization created Successsfully. Credentials send to Email"});
  } catch (error) {

    console.error("Create org error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const list = async (req, res) => {
  try {
    const orgs = await Org.find({});
    res.status(200).json(orgs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const active = async (req, res) => {
  try {
    const orgs = await Org.countDocuments({ status: "active" });
    res.status(200).json(orgs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const suspended = async (req, res) => {
  try {
    const orgs = await Org.countDocuments({ status: "suspended" });
    res.status(200).json(orgs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  const orgId = req.params.orgId;
  try {
  const fileDoc = await File.findOne({ organization: orgId });
    const [deletedOrg, deletedUsers, deletedClients, deletedInvoices, deletedFile] = await Promise.all([
      Org.findByIdAndDelete(orgId),
      User.deleteMany({ organization: orgId }),
      Client.deleteMany({organization: orgId}),
      Invoice.deleteMany({organization: orgId}),
      Product.deleteMany({organization: orgId}),
      File.deleteOne({organization:orgId})
    ]);
    if (!deletedOrg) {
      return res.status(404).json({ message: "Organization not found" });
    }
    if(fileDoc){
        const filePath = path.join(process.cwd(), "uploads", fileDoc.filename)
       if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath)
      console.log("file deleted successfully")
    }
    }  
    res.status(200).json({ message: "organization deleted" });
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ error: error.message });
  }
};


export const update = async (req, res) => {
  const orgId = req.params.orgId;
  const org = req.body;
  try {
    await Promise.all([
      //   Invoice.deleteMany({ organizationId: orgId }),
      //   Client.deleteMany({ organizationId: orgId }),
      //   Org.deleteOne({_id: orgId})
      // Add more collections here
    ]);

    const result = await Org.findByIdAndUpdate(orgId, org, { new: true });

    if (!result) {
      return res.status(404).json({ message: "Organization not found" });
    }
       await User.updateMany(
      { organization: orgId }, // all users belonging to this org
      { status: org.status } // update their status
    );

    res.status(200).json({ message: "Organization updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const templateNameUpdate = async (req, res) => {
  const orgId = req.params.orgId;
  const {templateName} = req.body;
  try {
   
    const result = await Org.findByIdAndUpdate(orgId, { $set: {templateName:templateName}});

    if (!result) {
      return res.status(404).json({ error: "Organization not found" });
    }
   
    res.status(200).json({ message: "Organization updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrg = async (req, res) => {
  const orgId = req.params.orgId;
  try {
   
    const result = await Org.findById(orgId);

    if (!result) {
      return res.status(404).json({ error: "Organization not found" });
    }
   
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
