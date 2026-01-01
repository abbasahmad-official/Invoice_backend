import Invoice from "../models/Invoice.js";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import ejs from "ejs";
import File from "../models/File.js";
import { Resend } from "resend";
import { url } from "inspector";
import Org from "../models/Org.js";
dotenv.config();
const resend = new Resend(process.env.RESEND_API);
import { limits } from "../config/limits.js";

// (async function () {
//   const { data, error } = await resend.emails.send({
//     from: 'Acme <onboarding@resend.dev>',
//     to: ['delivered@resend.dev'],
//     subject: 'Hello World',
//     html: '<strong>It works!</strong>',
//   });

//   if (error) {
//     return console.error({ error });
//   }

//   console.log({ data });
// })();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASS, // NOT your Gmail password — see below!
  },
});

// create invoice
export const create = async (req, res) => {
  try {
    const org = req.user.org;
   const orgUpdated =  await Org.findByIdAndUpdate(org._id, {
        $inc: { "usage.invoicesCreated": 1 },
    }, {new:true});
    req.user.usage.invoicesCreated = orgUpdated.usage.invoicesCreated
    req.user.org.usage.invoicesCreated =orgUpdated.usage.invoicesCreated
    const invoice = new Invoice(req.body);
    await invoice.save();

    res.status(200).json({ message: "Invoice saved successfully", invoice });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createSend = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    
    const _dirname = path.resolve();
    const templatePath = path.join(_dirname, "templates", "invoice.html");
    const InvoiceLink = `${
      "http://localhost:5173" || process.env.FRONTEND_URL
    }/pay/invoice/${invoice._id}`;
    await invoice.populate("client", "email name"); // <- this loads client email only
    const htmlContent = await ejs.renderFile(templatePath, {
      invoiceLink: InvoiceLink,
      contact: process.env.SENDER_EMAIL,
      year: new Date().getFullYear(),
    });
    await sendEmailDynamic(invoice.client.email, htmlContent);

    await invoice.save();
   const org = req.user.org;
   const orgUpdated =  await Org.findByIdAndUpdate(org._id, {
        $inc: { "usage.emailsSent": 1 },
    }, {new:true});
    req.user.usage.emailsSent = orgUpdated.usage.emailsSent
    req.user.org.usage.emailsSent =orgUpdated.usage.emailsSent

    res.status(200).json({ message: "Invoice saved and emailed" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const invoice = req.body;
    // if(invoice.status === "Paid") return res.status(200).json({message: "This invoice is already paid"})
    const _dirname = path.resolve();
    const templatePath = path.join(_dirname, "templates", "invoice.html");
    const InvoiceLink = `${
      "http://localhost:5173" || process.env.FRONTEND_URL
    }/pay/invoice/${invoice._id}`;
    const htmlContent = await ejs.renderFile(templatePath, {
      invoiceLink: InvoiceLink,
      contact: process.env.SENDER_EMAIL,
      year: new Date().getFullYear(),
    });
    await sendEmailDynamic(invoice.client.email, htmlContent);
       const org = req.user.org;
   const orgUpdated =  await Org.findByIdAndUpdate(org._id, {
        $inc: { "usage.emailsSent": 1 },
    }, {new:true});
    req.user.usage.emailsSent = orgUpdated.usage.emailsSent
    req.user.org.usage.emailsSent =orgUpdated.usage.emailsSent

    res.status(200).json({ message: "Email send successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// const sendEmailDynamic = async(recieverEmail, htmlContent) =>{
//     try{
//         await resend.emails.send({
//             from:`"Invoice System" <${process.env.SENDER_EMAIL}>`,
//             to: [recieverEmail],
//             subject: "Your invoice is ready for payment",
//             html: htmlContent
//         })
//     } catch(error){
//         console.error("error in invoice email send", error)
//     }
// }

const sendEmailDynamic = async (recieverEmail, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Invoice System" <${process.env.SENDER_EMAIL}>`,
      to: recieverEmail,
      subject: "Your invoice is ready for payment",
      html: htmlContent,
    });
  } catch (error) {
    console.error("error in invoice email send", error);
  }
};

// get all invoices
export const list = async (req, res) => {
  try {
    const { orgId, role } = req.query;
    const invoices = await Invoice.find({ organization: orgId }).populate(
      "client",
      "name email"
    );
    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listPaid = async (req, res) => {
  try {
    const { orgId } = req.query;
    const invoices = await Invoice.find({
      status: "Paid",
      organization: orgId,
    });

    // .populate("client", "name email");
    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const listPending = async (req, res) => {
  try {
    const { orgId } = req.query;
    const invoices = await Invoice.find({
      status: "Pending",
      organization: orgId,
    });
    // console.log(invoices);
    // .populate("client", "name email");
    return res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const listOverdue = async (req, res) => {
  try {
    const { orgId } = req.query;
    const invoices = await Invoice.countDocuments({
      status: "Overdue",
      organization: orgId,
    });
    // console.log(invoices);
    // .populate("client", "name email");
    return res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const listUserOverdue = async (req, res) => {
  try {
    const userId = req.params.userId;
    const invoices = await Invoice.countDocuments({
      status: "Overdue",
      createdBy: userId,
    });
    // console.log(invoices);
    // .populate("client", "name email");
    return res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listUserPaid = async (req, res) => {
  try {
    const userId = req.params.userId;
    const invoices = await Invoice.find({ status: "Paid", createdBy: userId });

    // .populate("client", "name email");
    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const listUserPending = async (req, res) => {
  try {
    const userId = req.params.userId;
    const invoices = await Invoice.find({
      status: "Pending",
      createdBy: userId,
    });
    // console.log(invoices);
    // .populate("client", "name email");
    return res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listCount = async (req, res) => {
  try {
    const { orgId } = req.query;
    const count = await Invoice.countDocuments({ organization: orgId });
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listCountByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const count = await Invoice.countDocuments({ createdBy: userId });
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// export const listCountByClient = async (req, res) => {
//     try {
//         const clientId = req.params.clientId;
//         const count = await Invoice.countDocuments({client:clientId});
//         res.status(200).json({ count });
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// get all invoices for user
export const listLast = async (req, res) => {
  try {
    const { orgId } = req.query;
    const invoices = await Invoice.find({ organization: orgId })
      .sort({ createdAt: -1 }) // Sort by newest
      .limit(3) // Get only the last 3
      .populate("client", "name email");

    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listUserLast = async (req, res) => {
  try {
    const userId = req.params.userId; // ✅ Fix typo: `teq` → `req`

    const invoices = await Invoice.find({ createdBy: userId }) // ✅ Filter by user
      .sort({ createdAt: -1 }) // Newest first
      .limit(3)
      .populate("client", "name email");

    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listInvoice = async (req, res) => {
  try {
    const userId = req.params.userId;
    const invoices = await Invoice.find({ createdBy: userId }).populate(
      "client",
      "name email"
    );
    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// list all invoices with same user and client
export const listInvoiceBoth = async (req, res) => {
  try {
    const userId = req.params.userId;
    const clientId = req.params.clientId;
    const invoices = await Invoice.find({
      createdBy: userId,
      client: clientId,
    });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get single invoice
export const read = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await Invoice.findById(invoiceId)
      .populate("client", "name _id email phone") // populate client fields
      .populate("items.productId", "name price _id");
    res.status(200).json(invoice);
  } catch (error) {
    res.status(404).json({ error: "invoice not found" });
  }
};

// update invoice
export const update = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const updated = await Invoice.findByIdAndUpdate(invoiceId, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const updateForUserPay = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const updated = await Invoice.findByIdAndUpdate(invoiceId, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete invoice
export const remove = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const updated = await Invoice.findByIdAndDelete(invoiceId);
    res.status(200).json({ message: "invoice deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// search by invoice

export const listSearch = async (req, res) => {
  try {
    const search = req.query.search?.trim().toLowerCase();
    const status = req.query.status;

    // Build Mongo query object (status filter)
    const query = {};
    if (status && ["Paid", "Pending", "Overdue"].includes(status)) {
      query.status = status;
    }

    // Fetch invoices with optional status filter, and populate client
    const invoices = await Invoice.find(query).populate({
      path: "client",
      select: "name email phone address",
    });

    // If no search query, return filtered by status only
    if (!search) {
      return res.json(invoices);
    }

    // Apply in-memory filtering for client fields and _id
    const filtered = invoices.filter((invoice) => {
      const client = invoice.client;

      return (
        client?.name?.toLowerCase().includes(search) ||
        client?.email?.toLowerCase().includes(search) ||
        client?.phone?.toLowerCase().includes(search) ||
        client?.address?.toLowerCase().includes(search) ||
        invoice._id.toString().toLowerCase().includes(search)
      );
    });

    return res.json(filtered);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Failed to perform search" });
  }
};

export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  console.log(amount);

  try {
    const amountInCents = Math.round(amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/invoice/template/:invoiceId
export const getInvoiceHtml = async (req, res) => {
  const {currencyValue, currencySymbol} = req.query

  console.log(`value:${currencyValue}, symbol:${currencySymbol}`)
  try {
    const invoiceData = await Invoice.findById(req.params.invoiceId)
      .populate("organization", "name email address phone templateName")
      .populate("client", "name email address phone")
      .populate({
        path: "items.productId",
        select: "name price",
      });

    if (!invoiceData) return res.status(404).send("Invoice not found");
    if (!invoiceData?.organization?.templateName) return res.status(404).send("Invoice template not found");

    const __dirname = path.resolve();
    const templatePath = path.join(
      __dirname,
      "templates",
     invoiceData.organization.templateName
    );
// 
    const createdAt = new Date(invoiceData.createdAt);
    const formattedDate = `${
      createdAt.getMonth() + 1
    }/${createdAt.getDate()}/${createdAt.getFullYear()}`;

    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxAmount = (subtotal * invoiceData.tax) / 100;
    //
    let logoUrl;

    // 1. Try to load logo from DB
    const invoiceLogo = await File.findOne({
      organization: invoiceData.organization,
    });
    // const invoiceLogoPic = await File.findOne({organization:invoiceData.organization})
    if (invoiceLogo !== null) {
      const base64 = invoiceLogo.logo.data.toString("base64");
      const mimeType = invoiceLogo.logo.contentType || "image/png"; // Ensure contentType is stored
      logoUrl = `data:${mimeType};base64,${base64}`;
    } else {
      // 2. Fallback
      logoUrl = `${process.env.VITE_API}/uploads/dummy-logo.png`;
    }
    if (invoiceLogo?.companyName) {
      invoiceData.organization.name = invoiceLogo.companyName;
    }

    // console.log(logoUrl)

    const htmlContent = await ejs.renderFile(templatePath, {
      logoUrl,
      companyName: invoiceData.organization.name,
      companyAddress: invoiceData.organization.address,
      companyEmail: invoiceData.organization.email,
      invoiceNumber: `# ${invoiceData.invoiceNumber}`,
      invoiceCreatedAt: formattedDate,
      clientName: invoiceData.client.name,
      clientAddress: invoiceData.client.address,
      clientEmail: invoiceData.client.email,
      clientPhone: invoiceData.client.phone,
      invoiceTotal: (invoiceData.totalAmount * currencyValue).toFixed(2),
      invoiceItems: invoiceData.items,
      invoiceSubtotal: (subtotal * currencyValue).toFixed(2),
      invoiceTaxPercent: invoiceData.tax,
      invoiceTax:( taxAmount * currencyValue).toFixed(2),
      accountNo: process.env.ACCOUNT_NO,
      accountName: process.env.ACCOUNT_NAME,
      BankName: process.env.ACCOUNT_BANK_NAME,
      currencySymbol,
      currencyValue
    });
    // console.log(invoiceLogo.path)
    res.send(htmlContent); // 👉 sends HTML for frontend preview
  } catch (err) {
    console.log(err);
    res.status(500).send("Error generating HTML template");
  }
};
