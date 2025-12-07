import express from "express";
import { getInvoiceHtml, updateForUserPay,createPaymentIntent ,sendEmail,createSend ,create, listUserOverdue ,listUserLast, list, read, update, listLast, listUserPaid, listOverdue,listUserPending,remove, listInvoice, listInvoiceBoth, listSearch, listPaid, listPending, listCount, listCountByUser} from "../controllers/invoice.js";
import {protect, adminOnly} from "../middleware/auth.js";
import { invoiceValidator } from "../validator/invoiceCreation.js";
import { checkLimit } from "../middleware/cheackLimit.js";
const router = express.Router();

router.post("/invoice/create", protect, invoiceValidator, checkLimit("invoiceLimit"), create);
router.post("/invoice/create/send", protect, invoiceValidator, checkLimit("emailLimit"),  createSend);
router.post("/invoice/email/send", protect, checkLimit("emailLimit"), sendEmail);
router.get("/invoice/view/:invoiceId", protect, read);
router.get("/invoice/client/view/:invoiceId", read);
router.put("/invoice/update/:invoiceId", protect, invoiceValidator, update);
router.put("/invoice/update/status/:invoiceId",  updateForUserPay);
router.delete("/invoice/remove/:invoiceId", protect, remove);
router.get("/invoices/user/:userId", protect, listInvoice);
router.get("/invoices/:userId/client/:clientId", protect, listInvoiceBoth);
router.get("/invoice/search", listSearch);
router.get("/invoice-template/html/:invoiceId", getInvoiceHtml);

// router.get("/invoice/template/:invoiceId", getInvoiceHTML);

// 
// router.get("/invoices", protect, list);
router.get("/invoices", list);
router.get("/invoices/last", listLast);
router.get("/invoices/last/:userId", listUserLast);
router.get("/invoices/count", listCount);
router.get("/invoices/count/:userId", listCountByUser);

router.get("/invoices/paid", listPaid);
router.get("/invoices/paid/:userId", listUserPaid);
router.get("/invoices/pending", listPending);
router.get("/invoices/overdue", listOverdue);
router.get("/invoices/overdue/:userId", listUserOverdue);
// router.get("/invoices/overdue/:userId", listUserOverdue);
router.get("/invoices/pending/:userId", listUserPending);
router.post("/create-payment-intent", createPaymentIntent)

export default router;