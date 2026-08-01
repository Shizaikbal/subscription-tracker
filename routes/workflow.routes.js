import { Router } from 'express';
import { sendReminders, testReminder } from '../controllers/workflow.controller.js';
import authorize from '../middlewares/auth.middleware.js';

const workflowRouter = Router();

workflowRouter.post('/subscription/reminder', sendReminders);

workflowRouter.post('/test-reminder', authorize, testReminder);

export default workflowRouter;
