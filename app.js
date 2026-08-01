import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { PORT } from './config/env.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/users.routes.js';
import subscriptionRouter from './routes/subscriptions.routes.js';
import workflowRouter from './routes/workflow.routes.js';

import connectToDatabase from './database/mongodb.js';

import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflow', workflowRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'API route not found' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorMiddleware);

if(process.env.VERCEL === undefined){
    app.listen(PORT, async () => {
        console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);

        await connectToDatabase();
    });
} else {
    await connectToDatabase();
}

export default app;
