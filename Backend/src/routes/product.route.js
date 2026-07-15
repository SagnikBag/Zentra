import express from "express";
import { authenticateSeller } from "../middleware/auth.middleware";


const router = express.Router()

router.post('/',authenticateSeller)



export default router
