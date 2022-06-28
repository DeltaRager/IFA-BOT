const config = require('../config.json')

async function initWebhook(client) {
    const channel = client.channels.cache.get('813260592357703722');
    try {
        const webhooks = await channel.fetchWebhooks();
        const webhook = webhooks.find(wh => wh.token);

        if (!webhook) {
            return console.log('No webhook was found that I can use!');
        }

        await webhook.send({
            content: 'Game Data',
            username: 'game-tracker',
            embeds: [embed],
        });
    } catch (error) {
        console.error('Error trying to send a message: ', error);
    }
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        initWebhook(client)
        console.log("Bot is ready!")
    }
}