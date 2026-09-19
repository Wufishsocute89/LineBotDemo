const express = require("express");
const line = require("@line/bot-sdk");

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

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
async function handleEvent(event) {
    if (event.type !== "message" || event.message.type !== "text") {
        return null;
    }
    const userMessage = event.message.text;
    console.log(`收到使用者訊息：${userMessage}`);
    const echo = { type: "text", text: `你剛說了：${event.message.text}` };
    try {
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [echo]
        });
    } catch (error) {
        console.error("error404");
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`伺服器正在 port ${port} 運行中！`);
});