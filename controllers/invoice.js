import Invoice from "../models/Invoice.js";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe =  Stripe(process.env.STRIPE_SECRET_KEY);

// create invoice
export const create = async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        await invoice.save();
        res.status(200).json(invoice);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//
export const createSend = async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        await invoice.save();
          const invoiceLink = `https://invoice-frontend-rxzv.vercel.app/pay/invoice/${invoice.id}`;
        await invoice.populate("client", "email name"); // <- this loads client email only
      console.log(invoice.client.email);
        const d  = await sendInvoiceLinkToUser(invoice.client.email, invoiceLink);
        console.log(d)
        res.status(200).json(invoice);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const sendEmail = async (req, res) => {
    try {
        const invoice = req.body;
        // await invoice.save();
          const invoiceLink = `https://invoice-frontend-rxzv.vercel.app/pay/invoice/${invoice.id}`;
        const d  = await sendInvoiceLinkToUser(invoice.client.email, invoiceLink);
        console.log(d)
        res.status(200).json(invoice);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abbasahmad8032@gmail.com',
    pass: 'ksibzdtzfubpaqcq' // NOT your Gmail password — see below!
  }
});

async function sendInvoiceLinkToUser(email, invoiceLink) {
try {
  await transporter.sendMail({
    from: '"Invoice System" <abbasahmad8032@gmail.com>', // Sender name & address
    to: email,                                           // Recipient's email
    subject: 'Your Invoice is Ready for Payment',
    text: `Hello, your invoice is ready. Please view and make the payment here: ${invoiceLink}`, // Fallback plain text
    html: `
      <p>Hello,</p>
      <p>Your invoice is ready and requires payment. Please view it here:</p>
      <p>
        <a href="${invoiceLink}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007BFF;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">
          View and Pay Invoice
        </a>
      </p>
      <p>Thank you for your prompt attention to this matter.</p>
    `
  });
} catch (error) {
  console.error('Error sending email:', error);
}

}






//

// get all invoices
export const list = async (req, res) => {
    try {
const {orgId, role} = req.query
        const invoices = await Invoice.find({organization:orgId})
            .populate("client", "name email");
        res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const listPaid = async (req, res) => {
    try {
        const {orgId} = req.query
        const invoices = await Invoice.find({ status: "Paid", organization: orgId })

        // .populate("client", "name email");
        res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const listPending = async (req, res) => {
    try {
        const {orgId} = req.query
        const invoices = await Invoice.find({ status: "Pending", organization: orgId })
        // console.log(invoices);
        // .populate("client", "name email");
        return res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const listOverdue = async (req, res) => {
    try {
            const {orgId} = req.query
        const invoices = await Invoice.countDocuments({ status: "Overdue", organization: orgId })
        // console.log(invoices);
        // .populate("client", "name email");
        return res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const listUserOverdue = async (req, res) => {
    try {
            const userId = req.params.userId ;
        const invoices = await Invoice.countDocuments({ status: "Overdue", createdBy: userId })
        // console.log(invoices);
        // .populate("client", "name email");
        return res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


export const listUserPaid = async (req, res) => {
    try {
        const userId = req.params.userId;
        const invoices = await Invoice.find({ status: "Paid", createdBy: userId })

        // .populate("client", "name email");
        res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
export const listUserPending = async (req, res) => {
    try {
        const userId = req.params.userId;
        const invoices = await Invoice.find({ status: "Pending", createdBy: userId })
        // console.log(invoices);
        // .populate("client", "name email");
        return res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}




export const listCount = async (req, res) => {
    try {
        const {orgId} = req.query
        const count = await Invoice.countDocuments({organization: orgId});
        res.status(200).json({ count });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const listCountByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const count = await Invoice.countDocuments({createdBy:userId});
        res.status(200).json({ count });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


// get all invoices for user
export const listLast = async (req, res) => {
    try {
        const {orgId} = req.query
        const invoices = await Invoice.find({organization: orgId})
            .sort({ createdAt: -1 }) // Sort by newest
            .limit(3)                // Get only the last 3
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
        const invoices = await Invoice.find({ createdBy: userId }).populate("client", "name email");
        res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// list all invoices with same user and client
export const listInvoiceBoth = async (req, res) => {
    try {
        const userId = req.params.userId;
        const clientId = req.params.clientId;
        const invoices = await Invoice.find({ createdBy: userId, client: clientId });
        res.status(200).json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

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
}

// update invoice
export const update = async (req, res) => {
    try {
        const invoiceId = req.params.invoiceId
        const updated = await Invoice.findByIdAndUpdate(invoiceId, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export const updateForUserPay = async (req, res) => {
    try {
        const invoiceId = req.params.invoiceId
        const updated = await Invoice.findByIdAndUpdate(invoiceId, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// delete invoice
export const remove = async (req, res) => {
    try {
        const invoiceId = req.params.invoiceId;
        const updated = await Invoice.findByIdAndDelete(invoiceId);
        res.status(200).json({ message: "invoice deleted" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

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
            select: "name email phone address"
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
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}
