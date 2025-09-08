import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({error: "Not authorized"});  
    }
    
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }    
}

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};