import { Router } from "express";
import { sendReminders } from "../controllers/workflow.controller.js";
import { manualCheckReminders } from "../utils/check-reminders.cron.js";

const workflowRouter = Router();
workflowRouter.post("/subscription/reminders", sendReminders);
workflowRouter.post("/cron/check-reminders", manualCheckReminders);


export default workflowRouter;
