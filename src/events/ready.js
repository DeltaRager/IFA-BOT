const express = require('express');
const https = require('https')
const config = require('./src/config.json')
const fs = require('fs')
const { MessageEmbed } = require('discord.js');

const embed = {
	color: 0x0099ff,
	title: 'Game Data',
	fields: [
		{
			name: 'Player List',
			value: '',
		},
	],
};

const app = express();
var embedMessage

app.use(
    express.urlencoded({
      extended: true,
    })
);

app.use(express.json())

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/api.auraxis.co/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/api.auraxis.co/fullchain.pem')
};

async function initEmbed(client) {
    const channel = client.channels.cache.get('813260592357703722');
    try {
        embedMessage = await channel.send({embeds : [embed]})
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

        initEmbed(client)

        app.post('/', async function (req, res) {
            res.writeHead(200);
            const channel = client.channels.cache.get('813260592357703722');
            try {
                let playerString = ""
                for(var attributename in req.body){
                    playerString = playerString + attributename + '\n'
                }
                
                if(embedMessage) {
                    const newEmbed = {
                        color: 0x0099ff,
                        title: 'Game Data',
                        fields: [
                            {
                                name: 'Player List',
                                value: playerString,
                            },
                        ],
                    };
                    embedMessage.edit({ embeds: [newEmbed] });
                }

            } catch (error) {
                console.error('Error trying to edit the message: ', error);
            }
            res.end();
        })
        console.log("Bot is ready!")
    }
}