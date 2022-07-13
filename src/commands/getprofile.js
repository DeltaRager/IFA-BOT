const noblox = require('noblox.js');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL, { keepAlive: true });
const playerCollection = client.db('CORE_DATA').collection('PLAYERS')

async function ViewProfile(args, message) {
    try {
        let userId = 0

        if (!args[0]) {
            
        } else {
            if (isNaN(args[0])) {
                userId = await noblox.getIdFromUsername(args[0])
            } else {
                userId = Number(args[0])
            }
        }

        let findResult = await playerCollection.find({
            "data.UserId" : userId
        }).toArray();

        findResult = findResult[0]
        let thumbnail_circHeadshot = await noblox.getPlayerThumbnail(userId, 420, "png", true, "Headshot")
        thumbnail_circHeadshot = thumbnail_circHeadshot[0].imageUrl

        let statString = ''
        for (var key in findResult.data.Stats) {
            if (findResult.data.Stats.hasOwnProperty(key)) {           
                statString += `**${findResult.data.Stats[key]}** ${key}\n`
            }
        }

        const exampleEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle('PROFILE')
			.setAuthor({ name: `${findResult.data.Username} (${findResult.key})`, url: `https://www.roblox.com/users/${userId}/profile`})
			.setDescription(`CustomDisplayName: **${findResult.data.CustomDisplayName}**\n\n**STATS**\n${statString}`)
			.setThumbnail(thumbnail_circHeadshot)

		await message.channel.send({ embeds: [exampleEmbed] });
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    name: 'getprofile',
    once: true,
    execute(args, message) {
        ViewProfile(args, message)
    }
}
