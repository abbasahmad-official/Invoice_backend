import cron from "node-cron";
import Invoice from "../models/Invoice.js"; // adjust path if needed

// Runs every day at midnight
cron.schedule("2 0 * * *", async () => { // Run daily at midnight
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to 00:00:00

    const result = await Invoice.updateMany(
      {
        status: "Pending",
        dueDate: { $lt: today } // Only dates *before* today
      },
      { $set: { status: "Overdue" } }
    );

    console.log(`✅ [CRON] Marked ${result.modifiedCount} invoices as Overdue`);
  } catch (error) {
    console.error("❌ Error updating overdue invoices:", error);
  }
});

