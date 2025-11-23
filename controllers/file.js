import File from "../models/File.js";
import path from "path";
import fs from "fs"

export const create = async (req, res) => {
// console.log(req.user)
  const orgId = req.user.role === "superAdmin" ? null : req.body.organization;

  try {
    const { companyName } = req.body;

    // find existing record first (to delete old file)
    const existingFile = await File.findOne(
      req.user.role === "superAdmin"
        ? { createdBy: req.user._id }
        : { organization: orgId }
    );

    // if file exists, remove it from disk
    if (req.file && existingFile) {
      const oldPath = path.join(process.cwd(), "uploads", existingFile.filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

        const updateData = {
      companyName,
      organization: orgId,
      createdBy: req.user._id,
    };

    // add file info if a new file is uploaded
    if (req.file) {
      updateData.fieldname = req.file.fieldname;
      updateData.originalname = req.file.originalname;
      updateData.filename = req.file.filename;
      updateData.path = req.file.path;
      updateData.mimetype = req.file.mimetype;
      updateData.size = req.file.size;
    }

    // now update or insert new record
    const updatedFile = await File.findOneAndUpdate(
      req.user.role === "superAdmin"
        ? { createdBy: req.user._id }
        : { organization: orgId },
      updateData,
      { new: true, upsert: true } // ⬅️ creates if not found
    );

    res.status(200).json({
      message: existingFile
        ? "✅ Logo replaced successfully!"
        : "✅ Logo uploaded successfully!",
      file: updatedFile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ Error uploading logo", error });
  }
};


export const remove = async(req, res) =>{
  console.log("hit")
  const {orgId} = req.query
  console.log(orgId)
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
    const filePath = path.join(process.cwd(), "uploads", data.filename)
    if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath)
      console.log("file deleted successfully")
    }

    return res.status(200).json({message: "logo removed successfully"})
  } catch(error){
    console.error(error)
  }

}

export const getLogo = async(req, res) =>{
  console.log("hit")
  const {orgId} = req.query
  console.log(orgId)
  try{
      let data;
    if(req.user.role == "superAdmin"){  
       data = await File.findOne({createdBy: orgId.toString()})
    } else{
       data = await File.findOne({organization: orgId})
    }
    if(!data){
      return res.status(200).json({error: "logo not found", status: 404})
    } 
    data.path = `/${data.path.replace(/\\/g, "/")}`;
    return res.status(200).json(data)
  } catch(error){
    console.error(error)
  }

}
