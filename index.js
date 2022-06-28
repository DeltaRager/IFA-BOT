const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_WEBHOOKS] });

const express = require('express');
const https = require('https')
const config = require('./src/config.json')
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

client.login(config.TOKEN);