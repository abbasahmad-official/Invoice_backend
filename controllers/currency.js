import currency from "../models/currency.js"
import Currency from "../models/currency.js"
import User from "../models/User.js"


export const list = async(req, res) => {
    try{
        const data = await Currency.find({})
            res.status(200).json(data)
    } catch(error){
        console.log(error)
    }
}

export const update = async (req, res) => {
  try {
    const { userId, currencyId } = req.params;

    // Check if the currency exists
    const currency = await Currency.findById(currencyId);
    if (!currency) {
      return res.status(404).json({ error: "Currency not found" });
    }

    // Update only the 'currency' field for the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { currency: currencyId } }, // only updates this field
      { new: true }                       // returns the updated document
    ).populate("currency");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser.currency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
