import express from "express";
import { login } from "./modules/auth/auth.controller.js";

const router = express.Router();

router.post("/auth/login", login);

export default router;