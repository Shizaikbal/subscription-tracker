import { Router } from 'express';
import {
    createSubscription,
    getSubscription,
    getUserSubscriptions,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    getUpcomingRenewals,
} from '../controllers/subscription.controller.js';
import authorize from '../middlewares/auth.middleware.js';

const subscriptionRouter = Router();

subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.use(authorize);

subscriptionRouter.get('/', getUserSubscriptions);

subscriptionRouter.post('/', createSubscription);

subscriptionRouter.get('/:id', getSubscription);

subscriptionRouter.put('/:id', updateSubscription);

subscriptionRouter.delete('/:id', deleteSubscription);

subscriptionRouter.put('/:id/cancel', cancelSubscription);

export default subscriptionRouter;
