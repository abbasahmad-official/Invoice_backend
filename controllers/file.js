import File from "../models/File.js";
import formidable from "formidable";
import fs from "fs";
import path from "path";


export const create = async (req, res) => {
  // const orgId = req.user.role === "superAdmin" ? null : req.body.organization;
  try {
    const { companyName, organization } = req.body;
    const logoFile = req.file;

    if (!companyName || !organization ) {
      return res.status(400).json({ error: "All fields are required" });
    }
  if(!logoFile?.size){
  return res.status(200).json({message:"empty"})
  }

    if (logoFile.size > 1.5 * 1024 * 1024) {
      return res.status(400).json({ error: "Image should be less than 1.5MB" });
    }

    const fileData = fs.readFileSync(logoFile.path);

    const orgId = req.user.role === "superAdmin" ? null : organization;

    const existingFile = await File.findOne(
      req.user.role === "superAdmin"
        ? { createdBy: req.user._id }
        : { organization: organization }
    );

    if (existingFile?.filename) {
      const oldPath = path.join(process.cwd(), "uploads", existingFile.filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updateData = {
      companyName,
      organization: orgId,
      createdBy: req.user._id,
      logo: {
        data: fileData,
        contentType: logoFile.mimetype,
      },
    };

    const updatedFile = await File.findOneAndUpdate(
      req.user.role === "superAdmin"
        ? { createdBy: req.user._id }
        : { organization: orgId },
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: existingFile
        ? "Logo replaced successfully!"
        : "Logo uploaded successfully!",
      file: updatedFile,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
};

export const  logo = (req, res) =>{
  // console.log(req.file.logo.data)
  if(req.file.logo.data){
    res.set("Content-Type", req.file.logo.contentType);
    return res.send(req.file.logo.data)
  }
}

export const logoMiddleware = async (req, res, next) =>{
  const {orgId} = req.params
try {
     let file;
    if(req.user.role == "superAdmin"){  
       file = await File.findOne({createdBy: orgId.toString()})
    } else{
       file = await File.findOne({organization: orgId})
    }
    // const file = await File.findOne({createdBy: orgId})
      

    if (!file) {
      return res.status(400).json({ error: "file not found" });
    }

    req.file = file;
    next();
  } catch (err) {
    console.error("Error in logo middleware:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// export const create = async (req, res) => {
// // console.log(req.user)
//   const orgId = req.user.role === "superAdmin" ? null : req.body.organization;
// console.log(req.file)
//   try {
//     const { companyName } = req.body;

//     // find existing record first (to delete old file)
//     const existingFile = await File.findOne(
//       req.user.role === "superAdmin"
//         ? { createdBy: req.user._id }
//         : { organization: orgId }
//     );
//     console.log(req.file)
//     // if file exists, remove it from disk
//     if (req.file && existingFile && existingFile.filename) {
//   const oldPath = path.join(process.cwd(), "uploads", existingFile.filename);
//   if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
// }


//         const updateData = {
//       companyName,
//       organization: orgId,
//       createdBy: req.user._id,
//     };

//     // add file info if a new file is uploaded
//     if (req.file) {
//       updateData.fieldname = req.file.fieldname;
//       updateData.originalname = req.file.originalname;
//       updateData.filename = req.file.filename;
//       updateData.path = req.file.path;
//       updateData.mimetype = req.file.mimetype;
//       updateData.size = req.file.size;
//     }

//     // now update or insert new record
//     const updatedFile = await File.findOneAndUpdate(
//       req.user.role === "superAdmin"
//         ? { createdBy: req.user._id }
//         : { organization: orgId },
//       updateData,
//       { new: true, upsert: true } // ⬅️ creates if not found
//     );

//     res.status(200).json({
//       message: existingFile
//         ? "Logo replaced successfully!"
//         : "Logo uploaded successfully!",
//       file: updatedFile,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({error: error.message});
//   }
// };


export const remove = async(req, res) =>{

  const {orgId} = req.query
  console.log(orgId)
  console.log(req.user)
  try{
      let data;
    if(req.user.role == "superAdmin"){  
       data = await File.findOneAndDelete({createdBy: orgId.toString()})
    } else{
       data = await File.findOneAndDelete({organization: orgId})
    }
    if(!data){
      return res.status(200).json({error: "logo not found", status: 404})
    } 
    
    return res.status(200).json({message: "logo removed successfully"})
  } catch(error){
    console.error(error)
  }

}

export const getLogo = async(req, res) =>{
  const {orgId} = req.query
  try{
      let data;
    if(req.user.role == "superAdmin"){  
       data = await File.findOne({createdBy: orgId.toString()}).select("-logo")
    } else{
       data = await File.findOne({organization: orgId}).select("-logo")
    }
    if(!data){
      return res.status(200).json({error: "logo not found", status: 404})
    } 
    if(!data.path && !data.companyName){
      return res.status(400).json({error:"no logo info" })
    }
   
    return res.status(200).json(data)
  } catch(error){
    console.error(error)
  }

}
