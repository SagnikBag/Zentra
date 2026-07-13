import dotenv from "dotenv";
dotenv.config();

if(!process.env.MONGO_URI){
    console.error("MONGO_URI is not defined in the environment variables");
}
if(!process.env.JWT_SECRET){
    console.error("JWT_SECRET is not defined in the environment variables");
}

if(!process.env.GOOGLE_CLIENT_ID){
    console.error("GOOGLE_CLIENT_ID is not defined in the enviroment variable")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    console.error("GOOGLE_CLIENT_SECRET is not defined in the enviroment variable")
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET
}