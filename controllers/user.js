import User from "../models/User.js";

export const listCount = async (req, res) => {
  try {
    const {orgId} = req.query

    const count = await User.countDocuments({organization: orgId});
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// export const createByAdmin = async(req,res) => {
//         const {email} = req.body
//     try{

//         const result = await User.findById(req.body);
//         res.status(200).json(result);
//     }catch(error){
//         res.status(400).json({error: error.message})
//     }
// }

export const update = async (req, res) => {
  const { userId } = req.query;
  const { ...updatedUser } = req.body;
  console.log(updatedUser);

  try {
    // const userExists = await User.findById(userId);
    // if (!userExists) {
    //   return res.status(404).json({ error: "User not found" });
    // }
    // console.log("User before update:", userExists);

    const result = await User.findByIdAndUpdate(
      userId,
      { $set: updatedUser },
      { new: true }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listManagers = async (req, res) => {
  const { userId, role } = req.query;
  // console.log(userId)
  try {
    const result = await User.find({ organization: userId, role: role });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const  listByStatus = async (req, res) => {
    const { status } = req.params;
    const { orgId, role } = req.query;
  console.log({orgId, status})
  try {
    const result = await User.countDocuments({ organization: orgId ,status: status, role: role });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export const removeManager = async(req,res) => {
  const {managerId} = req.params
  try{
      const removedItem = await User.findByIdAndDelete(managerId, {new:true})
      res.status(200).json({message:"remove successfully", item:removedItem})
  }catch(error){
    console.log(error)
  }
}