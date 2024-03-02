import cron from 'node-cron';
import taskController from '../controllers/task.controller.js'; 
import userModel from '../models/user.model.js'; 
import {trySendTwilioNotification} from "./twilioService.js"

class CronScheduler {
    constructor() {
        
        setImmediate(() => {
            this.updateUserPriorities();
            // this.schedulePriorityUpdates();
            // this.callZeroPriorityUsers() ; 
            // this.scheduleCallsForZeroPriorityUsers('0 0 * * *');
            this.callZeroPriorityUsers('* * * * *'); 
        });
    }

    async updateUserPriorities() {
        // console.log('Updating user priorities...');
        await taskController.updateUserPriorities(); 
    }

    schedulePriorityUpdates() {
        cron.schedule('* * * * * *', async () => {
            // console.log('Scheduled user priority update');
            await this.updateUserPriorities();
        });
    }

  

    callZeroPriorityUsers() {
        cron.schedule('* * * * *', async () => {
            try {
                const usersWithZeroPriority = await userModel.find({ priority: 0, called: { $ne: true } });
                for (const user of usersWithZeroPriority) {
                    // console.log(`Calling user ${user.name} at ${user.phone_number}`);
                    await trySendTwilioNotification(user.phone_number);
                    user.called = true; // Mark user as called to prevent duplicate calls
                    await user.save();
                }
            } catch (error) {
                // console.error('Failed to call users with priority 0:', error);
                console.log("User is not registered with twilio ")
            }
        });
    }
}

export default new CronScheduler();
