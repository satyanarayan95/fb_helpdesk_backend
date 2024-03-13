const Message = require("../models/Message");


const webhookVerify = async (req, res) => {
    try {
        const verifyToken = process.env.FB_WEBHOOK_TOKEN;
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        const mode = req.query['hub.mode'];

        if (mode === 'subscribe' && token === verifyToken) {
            console.log('Webhook verified');
            res.status(200).send(challenge);
        } else {
            console.error('Verification failed. Make sure the validation tokens match.', { token, verifyToken });
            res.sendStatus(403);
        }
    } catch (error) {
        console.error('Error verifying webhook:', error.message);
        res.sendStatus(500);
    }
};



const messageDlr = async (req, res) => {
    try {
        const body = req.body;
        if (body?.entry) {
            const entry = body?.entry[0];
            const senderId = entry?.messaging[0]?.sender?.id;
            const pageId = entry?.messaging[0]?.recipient?.id;
            const message = entry?.messaging[0]?.message?.text;
            const timestamp = entry?.messaging[0]?.message?.timestamp;

            const newMessage = new Message({
                clientId: senderId,
                senderId: senderId,
                pageId: pageId,
                message: message,
                created_at: timestamp || new Date().getTime()
            });

            await newMessage.save();
            res.status(200).end();
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error handling webhook event:', error.message);
        res.sendStatus(500);

    }
};



module.exports = {
    webhookVerify,
    messageDlr
}
