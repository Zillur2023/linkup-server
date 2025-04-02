import { Router } from "express";
import { ChatControllers } from "./chat.controller";

const router = Router();

router.post("/createChat", ChatControllers.createChat);

export const ChatRouters = router;
