import { param } from "express-validator";
import Client from "../models/Client.js";
import Invoice from "../models/Invoice.js";
import mongoose from "mongoose";
import { limits } from "../config/limits.js";
import Org from "../models/Org.js";

// create client
export const create = async (req, res) => {
  try {
    const org = req.user.org
    const orgUpdated = await Org.findByIdAndUpdate(
      org._id,
      {
        $inc: { "usage.customersCreated": 1 },
      },
      { new: true }
    );
    req.user.usage.customersCreated = orgUpdated.usage.customersCreated;
    req.user.org.usage.customersCreated = orgUpdated.usage.customersCreated;
    const client = new Client(req.body);
    await client.save();
    res.status(200).json(client);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

// get all clients
export const list = async (req, res) => {
  try {
    const { orgId, role } = req.query;
    const clients = await Client.find({ organization: orgId });
    res.status(200).json(clients);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const listCount = async (req, res) => {
  try {
    const { orgId } = req.query;
    console.log(orgId);
    const count = await Client.countDocuments({ organization: orgId });
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listUserCount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const count = await Client.countDocuments({ createdBy: userId });
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listClient = async (req, res) => {
  try {
    const userId = req.params.userId;
    const clients = await Client.find({ createdBy: userId });
    res.status(200).json(clients);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
import { ObjectId } from "mongodb"; // top of your file

export const listClientInvoiceCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Client.aggregate([
      // 1. Filter clients by user
      { $match: { createdBy: new ObjectId(userId) } },

      // 2. Lookup invoices for each client
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "client",
          as: "invoiceData",
        },
      },
      // 3. Add invoiceCount field
      {
        $addFields: {
          invoiceCount: { $size: "$invoiceData" },
        },
      },

      // 4. Remove invoiceData array from output
      {
        $project: { invoiceData: 0 },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get single client
export const read = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const client = await Client.findById(clientId);
    res.status(200).json(client);
  } catch (error) {
    res.status(404).json({ error: "client not found" });
  }
};

// update client
export const update = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const updated = await Client.findByIdAndUpdate(clientId, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete client
export const remove = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const updated = await Client.findByIdAndDelete(clientId);
    res.status(200).json({ message: "client deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// list search by name description
export const listSearch = async (req, res) => {
  try {
    const query = {};

    // If a search term is provided, search in name OR description
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { phone: { $regex: req.query.search, $options: "i" } },
        { address: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const clients = await Client.find(query);

    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error fetching products" });
  }
};

export const listAllClientInvoiceCounts = async (req, res) => {
  try {
    const { orgId } = req.query;

    const result = await Client.aggregate([
      // 1. Filter clients by user
      { $match: { organization: new mongoose.Types.ObjectId(orgId) } },

      // 2. Lookup invoices for each client
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "client",
          as: "invoiceData",
        },
      },
      // 3. Add invoiceCount field
      {
        $addFields: {
          invoiceCount: { $size: "$invoiceData" },
        },
      },

      // 4. Remove invoiceData array from output
      {
        $project: { invoiceData: 0 },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
