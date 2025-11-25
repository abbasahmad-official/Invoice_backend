// import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
import path from "path";
import ejs from "ejs";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import File from "../models/File.js";

export const downloadPDF = async (req, res) => {
  // try {
  //   const { html, css } = req.body;

  //   if (!html) return res.status(400).send("No HTML provided");

  //   const finalHTML = `
  //     <html>
  //       <head>
  //         <meta charset="utf-8" />
  //         <style>${css || ""}</style>
  //       </head>
  //       <body>
  //         ${html}
  //       </body>
  //     </html>
  //   `;

  //   const browser = await puppeteer.launch({
  //  headless: true, // "new" mode may fail on some Render Linux builds
  // args: ["--no-sandbox", "--disable-setuid-sandbox"]
  //   });

  //   const page = await browser.newPage();

  //   await page.setContent(finalHTML, {
  //     waitUntil: "networkidle0",
  //   });

  //   const pdf = await page.pdf({
  //     format: "A4",
  //     printBackground: true,
  //   });

  //   await browser.close();

  //   res.setHeader("Content-Type", "application/pdf");
  //   res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
  //   res.send(pdf);
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).send("PDF generation failed");
  // }
};



export const downloadPdfTemplate = async (req, res) => {
  try {
    const invoiceData = new Invoice(req.body);
    await invoiceData.populate("organization", "name email address phone");
    await invoiceData.populate("client", "name email address phone");
    await invoiceData.populate({
      path: "items.productId",
      select: "name price",
    });

    const __dirname = path.resolve();
    const templatePath = path.join(
      __dirname,
      "templates",
      "invoice-template.html"
    );

    const createdAt = new Date(invoiceData.createdAt);
    const formattedDate = `${
      createdAt.getMonth() + 1
    }/${createdAt.getDate()}/${createdAt.getFullYear()}`;

    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const taxAmount = (subtotal * invoiceData.tax) / 100;

    let logoUrl;
    const invoiceLogo = await File.findOne({
      organization: invoiceData.organization,
    });

    if (invoiceLogo?.path) {
      logoUrl = `${process.env.VITE_API}/${invoiceLogo.path.replace(/\\/g, "/")}`;
    } else {
      logoUrl = `${process.env.VITE_API}/uploads/dummy-logo.png`;
    }

    if (invoiceLogo?.companyName) {
      invoiceData.organization.name = invoiceLogo.companyName;
    }

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
      invoiceTotal: invoiceData.totalAmount,
      invoiceItems: invoiceData.items,
      invoiceSubtotal: subtotal,
      invoiceTaxPercent: invoiceData.tax,
      invoiceTax: taxAmount.toFixed(2),
      accountNo: process.env.ACCOUNT_NO,
      accountName: process.env.ACCOUNT_NAME,
      BankName: process.env.ACCOUNT_BANK_NAME,
    });

    // ------------------------------------------------------------------
    // 🟦 UNIVERSAL PUPPETEER LAUNCHER (WORKS ON LOCAL + RENDER)
    // ------------------------------------------------------------------
    const isLocal =
      !process.env.AWS_REGION &&
      process.env.NODE_ENV !== "production";

    let browser;

    if (isLocal) {
      // 👉 LOCAL PC mode — use installed Chrome
      const localChromePath =
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

      browser = await puppeteer.launch({
        headless: true,
        executablePath: localChromePath,
        args: [],
      });
    } else {
      // 👉 RENDER / SERVERLESS mode — use chrome-aws-lambda
      browser = await puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        headless: chromium.headless,
      });
    }

    // ------------------------------------------------------------------

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${Date.now()}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const downloadPDFPublic = async (req, res) => {
  // try {
  //   const { html, css } = req.body;

  //   if (!html) return res.status(400).send("No HTML provided");

  //   const finalHTML = `
  //     <html>
  //       <head>
  //         <meta charset="utf-8" />
  //         <style>${css || ""}</style>
  //       </head>
  //       <body>
  //         ${html}
  //       </body>
  //     </html>
  //   `;

  //   const browser = await puppeteer.launch({
  //     headless: "new",
  //     args: ["--no-sandbox"],
  //   });

  //   const page = await browser.newPage();

  //   await page.setContent(finalHTML, {
  //     waitUntil: "networkidle0",
  //   });

  //   const pdf = await page.pdf({
  //     format: "A4",
  //     printBackground: true,
  //   });

  //   await browser.close();

  //   res.setHeader("Content-Type", "application/pdf");
  //   res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
  //   res.send(pdf);
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).send("PDF generation failed");
  // }
};
