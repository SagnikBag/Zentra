import dotenv from "dotenv";
dotenv.config();

if(!process.env.MONGO_URI){
    console.error("MONGO_URI is not defined in the environment variables");
}

export const config = {
    MONGO_URI: process.env.MONGO_URI
}