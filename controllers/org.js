import Org from "../models/Org.js";
import Client from "../models/Client.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

export const create = async (req, res) => {
  try {
    // console.log(req.body)
    const { newPassword, ...safeOrg } = req.body;
    const org = await new Org(safeOrg);
    const newUser = {
      name: org.name,
      email: org.email,
      organization: org._id,
      role: "admin",
      password: newPassword,
    };
    const findByEmail = await User.findOne({ email: org.email });
    console.log("findByEmail");
    if (!findByEmail) {
      const user = new User(newUser);
      await user.save();
      await org.save();
      res.status(200).json({ org, user });
    } else {
      res
        .status(200)
        .json({ error: "This User already exists. Duplication error" });
    }
  } catch (error) {
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
    //  await Promise.all([
    //   Invoice.deleteMany({ organizationId: orgId }),
    //   Client.deleteMany({ organizationId: orgId }),
    //   Org.deleteOne({_id: orgId})
    // Add more collections here
    // ]);
    //  const result = await Org.findByIdAndDelete(orgId);
    const [deletedOrg, deletedUsers] = await Promise.all([
      Org.findByIdAndDelete(orgId),
      User.deleteMany({ organization: orgId }),
    ]);

    if (!deletedOrg) {
      return res.status(404).json({ message: "Organization not found" });
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

    res.status(200).json({ message: "organization deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
