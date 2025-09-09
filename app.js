import express from "express";
import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

dotenv.config();
const app = express();

//Routes import
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/client.js";
import productRoutes from "./routes/product.js";
import invoiceRoutes from "./routes/invoice.js";
import userRoutes from "./routes/user.js";
// other imports
import "./jobs/updateOverdueInvoices.js"; // 👈 import the cron job



// Middlewares
// app.use(cors());
const allowedOrigin = 'https://invoice-frontend-rxzv.vercel.app';
app.use(cors({
  origin: allowedOrigin,
  credentials: true, // If you're using cookies or auth headers
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


// database connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
    try{
        console.log("database connected");
    }catch(error){
        console.log("error in connecting database",error);
    }
});

//Routes middleware
app.use("/api", authRoutes);
app.use("/api", clientRoutes);
app.use("/api", productRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", userRoutes);



// port listen
 const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}` ))

