import Client from "../models/Client.js";


// create client
export const create = async(req, res) => {
    try{
        const client = new Client(req.body);
        await client.save();
        res.status(200).json(client);
    }catch(error){
        res.status(400).json({error: error.message})
    }
}

// get all clients
export const list = async(req,res) => {
    try{

        const clients = await Client.find({});
        res.status(200).json(clients);
    }catch(error){
        res.status(400).json({error: error.message})
    }
}
export const listCount = async(req,res) => {
    try{

        const count = await Client.countDocuments();
        res.status(200).json({count});
    }catch(error){
        res.status(400).json({error: error.message})
    }
}

export const listUserCount = async(req,res) => {
    try{
        const userId = req.params.userId;
        const count = await Client.countDocuments({createdBy:userId});
        res.status(200).json({count});
    }catch(error){
        res.status(400).json({error: error.message})
    }
}

export const listClient = async(req,res) => {
    try{
        const userId = req.params.userId;
        const clients = await Client.find({createdBy:userId});
        res.status(200).json(clients);
    }catch(error){
        res.status(400).json({error: error.message})
    }
}



// get single client
export const read = async(req, res) => {
    try{
        const clientId = req.params.clientId;
        const client = await Client.findById(clientId);
        res.status(200).json(client);
    }catch(error){
        res.status(404).json({error: "client not found"});
    }
}

// update client
export const update = async(req, res) => {
    try{
        const clientId = req.params.clientId
        const updated = await Client.findByIdAndUpdate(clientId, req.body, {new:true});
        res.status(200).json(updated);
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

// delete client
export const remove = async(req, res) => {
    try{
        const clientId = req.params.clientId;
        const updated = await Client.findByIdAndDelete(clientId);
        res.status(200).json({message: "client deleted"});
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

// list search by name description
export const listSearch = async (req, res) => {
  try {
    const query = {};

    // If a search term is provided, search in name OR description
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        {phone: { $regex: req.query.search, $options: 'i' } },
        {address: { $regex: req.query.search, $options: 'i' } }

      ];
    }

    const clients = await Client.find(query);

    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error fetching products' });
  }
};