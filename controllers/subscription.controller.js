import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js'

export const createSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id
        });

        let workflowRunId = null;

        try {
            const { workflowRunId: runId } = await workflowClient.trigger({
                url: `${SERVER_URL}/api/v1/workflow/subscription/reminder`,
                body: {
                    subscriptionId: subscription._id,
                },
                headers: {
                    'content-type': 'application/json',
                },
                retries: 0
            });
            workflowRunId = runId;
            console.log('Workflow triggered:', workflowRunId);
        } catch (error) {
            console.log('Workflow trigger failed (subscription still created):', error.message);
        }

        res.status(201).json({
            success: true,
            data: subscription, workflowRunId
        });
    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try{
        const subscriptions = await Subscription.find({ user: req.user._id });

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        next(error);
    }
}

export const getSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.findById(req.params.id);

        if(!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        if(subscription.user.toString() !== req.user._id.toString()){
            const error = new Error("You do not have access to this subscription");
            error.statusCode = 403;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: subscription
        })
    } catch (error) {
        next(error)
    }
};

export const updateSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.findById(req.params.id);

        if(!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        if(subscription.user.toString() !== req.user._id.toString()){
            const error = new Error("You do not have access to this subscription");
            error.statusCode = 403;
            throw error;
        }

        const allowedFields = ['name', 'price', 'currency', 'frequency', 'category', 'paymentMethod', 'status', 'startDate', 'renewalDate'];
        allowedFields.forEach((field) => {
            if(req.body[field] !== undefined) subscription[field] = req.body[field];
        });

        const updated = await subscription.save();

        res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (error) {
        next(error)
    }
};

export const deleteSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.findById(req.params.id);

        if(!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        if(subscription.user.toString() !== req.user._id.toString()){
            const error = new Error("You do not have access to this subscription");
            error.statusCode = 403;
            throw error;
        }

        await subscription.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully',
        });
    } catch (error) {
        next(error)
    }
};

export const cancelSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.findById(req.params.id);

        if(!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        if(subscription.user.toString() !== req.user._id.toString()){
            const error = new Error("You do not have access to this subscription");
            error.statusCode = 403;
            throw error;
        }

        subscription.status = 'cancelled';
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription,
        });
    } catch (error) {
        next(error)
    }
};

export const getUpcomingRenewals = async (req, res, next) => {
    try{
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const subscriptions = await Subscription.find({
            user: req.user._id,
            status: 'active',
            renewalDate: { $gte: new Date(), $lte: sevenDaysFromNow },
        }).sort({ renewalDate: 1 });

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions,
        });
    } catch (error) {
        next(error)
    }
};
