import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  name: String,      // "Euro"
  code: String,      // "EUR"
  symbol: String,    // "€"
  conversionRate: Number,  // relative to USD
});
export default mongoose.model("Currency", currencySchema);
