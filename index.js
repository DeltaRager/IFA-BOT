const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_WEBHOOKS] });

const express = require('express');
const https = require('https')
const config = require('./src/config.json')
const fs = require('fs')
const path = require('path');

const dirPath = path.resolve(__dirname, './src/events');

const eventFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

const embed = new MessageEmbed()
	.setTitle('Players')
	.setColor('#0099ff');

const app = express();

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



for (const file of eventFiles) {
	const event = require(`${dirPath}/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

app.post('/', async function (req, res) {
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

client.login(config.TOKEN);
https.createServer(options,app).listen(443,  () => {
	console.log("Listening")
});