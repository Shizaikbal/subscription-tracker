import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js'
import { getMe, updateMe, deleteMe } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.use(authorize);

userRouter.get('/me', getMe);

userRouter.patch('/me', updateMe);

userRouter.delete('/me', deleteMe);

export default userRouter;
