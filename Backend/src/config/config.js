import dotenv from "dotenv";
dotenv.config();

if(!process.env.MONGO_URI){
    console.error("MONGO_URI is not defined in the environment variables");
}
if(!process.env.JWT_SECRET){
    console.error("JWT_SECRET is not defined in the environment variables");
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
}