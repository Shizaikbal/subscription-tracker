import dayjs from'dayjs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js'

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) =>{
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId)

    if(!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);

    if(renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for the subscription ${subscriptionId}. Stopping Workflow`);
        return;
    }

    for(const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        if (reminderDate.isBefore(dayjs())) {
            continue; // this reminder point is already in the past — skip it entirely, don't trigger it
        }

        await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);

        await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    }
});

export const testReminder = async (req, res, next) => {
    try {
        const { subscriptionId, type } = req.body;

        const subscription = await Subscription.findById(subscriptionId ?? null).populate('user', 'email name');

        if(subscription){
            if(subscription.user._id.toString() !== req.user._id.toString()){
                const error = new Error("You do not have access to this subscription");
                error.statusCode = 403;
                throw error;
            }
        }

        if(!subscription){
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        const emailType = type ?? 'test reminder';

        await sendReminderEmail({
            to: subscription.user.email,
            type: emailType,
            subscription,
        });

        res.status(200).json({
            success: true,
            message: `Test reminder email (${emailType}) sent to ${subscription.user.email}`,
        });
    } catch (error) {
        next(error);
    }
}

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'email name');
    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder to ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        })
    })
}
