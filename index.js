const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_WEBHOOKS] });

require('dotenv').config();
const fs = require('fs')
const path = require('path');

const dirPath = path.resolve(__dirname, './src/events');

const eventFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`${dirPath}/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.TOKEN);

// couldnt figure out where the hell to put these to make them work
// client.user.setUsername('Core of Aurax')
// client.user.setAvatar('https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905')