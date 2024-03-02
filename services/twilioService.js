
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.ACCOUNTS_ID, process.env.AUTH_TOKEN);

const trySendTwilioNotification = async (phoneNumber) => {
        try {
            await client.calls.create({
                url: 'http://demo.twilio.com/docs/voice.xml',
                to: phoneNumber,
                from: process.env.FROM_PHONE_NUMBER,
            });
            // console.log(`Notification sent to ${phoneNumber}`);
        } catch (error) {
            // await new Promise(resolve => setTimeout(resolve, 1000)); 
            console.log(error)
        }
    // }
};

export { trySendTwilioNotification };
