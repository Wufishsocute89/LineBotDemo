const express = require("express");
const line = require("@line/bot-sdk");
const {GoogleGenAI} = require("@google/genai");

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const ai = new GoogleGenAI();
const app = express();

app.post("/webhook", line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

const client = new line.messagingApi.MessagingApiClient(config);
const blob = new line.messagingApi.MessagingApiBlobClient(config);
async function handleEvent(event) {
    if (event.type == "message") {
        const userId = event.source.userId;
        console.log(`收到使用者ID:${userId}`);
        
        let replyText = '發生了一點錯誤，請稍後再試！';
        try {
            if (event.message.type == "text") {
                const userMessage = event.message.text;
                const response = await ai.models.generateContent({
                    model:"gemini-2.5-flash",
                    contents:userMessage
                })
            }
        } catch (err) {
            console.error("Gemini API Wrong:",err);
        }

        try {
            await client.replyMessage({
                replyToken: event.replyToken,
                messages:[{type:"text",text:replyText}]
            })
        } catch(err) {
            console.error("Reply False:",err)
        }
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`伺服器正在 port ${port} 運行中！`);
});