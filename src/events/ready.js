const config = require('../config.json')
const fs = require('fs')
const express = require('express');

const { MessageEmbed } = require('discord.js');

const embed = new MessageEmbed()
	.setTitle('Players')
	.setColor('#0099ff');

const app = express();

let playerList = []

app.use(
    express.urlencoded({
      extended: true,
    })
);

app.use(express.json())

app.post('/', function async (req, res) {
    res.writeHead(200);
    const channel = client.channels.cache.get('813260592357703722');
    try {
        const webhooks = await channel.fetchWebhooks();
        const webhook = webhooks.find(wh => wh.token);

        if (!webhook) {
            return console.log('No webhook was found that I can use!');
        }
        let playerString = ""
        for(var attributename in req.body){
            playerString = attributename + '\n'
        }

        await webhook.editMessage({
            content: playerString,
            username: 'game-tracker',
        });
    } catch (error) {
        console.error('Error trying to edit the message: ', error);
    }

    res.end();
})

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/api.auraxis.co/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/api.auraxis.co/fullchain.pem')
};

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
        https.createServer(options,app).listen(443,  () => {
            console.log("Listening")
        });
        initWebhook(client)
        
        console.log("Bot is ready!")
    }
}