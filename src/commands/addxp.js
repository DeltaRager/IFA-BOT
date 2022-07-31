const noblox = require('noblox.js');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL, { keepAlive: true });
const playerCollection = client.db('CORE_DATA').collection('PLAYERS')
const rolesCollection = client.db('CORE_DATA').collection('ROLES')

const barEmojis = {
    Progress : {
        Start : '<:bluestart:1003071362044264480>',
        Mid : '<:bluemid:1003071360655970306>',
        Switch : '<:blueswitch:1003086990188752896>'
    },
    Combat : {
        Start : '<:redstart:1003064069957369987>',
        Mid : '<:redmid:1003064069219164290>',
        Switch : '<:redswitch:1003064070779441182>'
    },
    Citizenship : {
        Start : '<:goldstart:1003071355673129010>',
        Mid : '<:goldmid:1003071351764041769>',
        Switch : '<:goldswitch:1003071357086609510>'
    },
    Colony : {
        Start : '<:grstart:1003071359141806271>',
        Mid : '<:grmid:1003071357824815217>',
        Switch : '<:grswitch:1003071359917752402>'
    },
    General : {
        Start : '<:whitestart:1003086907745513544>',
        Mid : '<:whitemid:1003086926686990406>',
        Switch : '<:whiteswitch:1003086954839162890>',
        DarkMid : '<:darkmid:1003064067914748035>',
        DarkEnd : '<:darkend:1003064067163967508>',
    }
}

async function AddXP(args, message) {
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

        if (!userId) {
            userId = await noblox.getIdFromUsername(message.author.username)
        }

        let playerInfo = await noblox.getPlayerInfo(userId)

        let findResult = await playerCollection.find({
            "data.UserId" : userId
        }).toArray();
       
        findResult = findResult[0]
     
        let thumbnail_circHeadshot = await noblox.getPlayerThumbnail(userId, 420, "png", true, "Headshot")
        thumbnail_circHeadshot = thumbnail_circHeadshot[0].imageUrl

        if (!findResult) {
            const noPlayerEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle('User not in CORE database.')
			.setAuthor({ name: `${args[0]} (${userId})`, url: `https://www.roblox.com/users/${userId}/profile`})
			.setDescription(`AURCORE did not find a player with that username in the database. Use **#profile** to create a blank CORE Profile for this user.`)
            .setThumbnail(thumbnail_circHeadshot)
            .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });

		await message.channel.send({ embeds: [noPlayerEmbed] });
        return
        }

        let member = message.guild.members.cache.get()

        function getCustomDisplayName() {
            if (findResult.data.CustomDisplayName != "") {
                return findResult.data.CustomDisplayName
            } else {
                return playerInfo.displayName
            }
        }

        let roleIcons = { // icons that correspond to strings of role.name in the combined fleets communications discord
            Emperor: `<:Emperor:996967524199575663>`,
            ["Grand Admiral"]: `<:Admiral:996967532432990210>`,
            Admiral: `<:Admiral:996967532432990210>`,
            ["[H] Legate"]: `<:Legate:996967528817496114>`,
            ["[H] Commandant"]: `<:Commandant:996967523499122748>`,
            ["[O] Commodore"]: `<:Centurion:996967522450554940>`,
            ["[O] Centurion"]: `<:Centurion:996967522450554940>`,
            ["[S] Subcenturion"]: `<:Subcenturion:996967530746892308>`,
            ["[E] Ensign"]: `<:Ensign:996968332370661447>`,
            ["[L] Legionnaire"]: `<:Legionnaire:996967529698316398>`,
            ["[5] Vanguard"]: `<:Vanguard:996967531703177286>`,
            ["[4] Guard"]: `<:Guard:996968334027395104>`,
            ["[3] Lancer"]: `<:Lancer:996967526988791828>`,
            ["[2] Auxiliary"]: `<:Auxiliary:996967521578127500>`,
            ["[1] Enlist"]: `<:Enlist:996967525638213762>`,
        }
        let groupRolesArray = await noblox.getRoles(3115240)
        // console.log(groupRolesArray)
        let groupRole = await noblox.getRankNameInGroup(3115240, userId)
        let nextRole

        // finding user's role in roles list

        function get_current_role_index() { // we need to find the player's current rank index in the role list so we can figure out what the next rank is
            for (let i = 0; i < groupRolesArray.length; i++) {
                const role = groupRolesArray[i];
                if (role.name == groupRole) {
                    // console.log(`Player is a ${groupRole} ${i}/${groupRolesArray.length}`)
                    return i
                }
            }
        }

        let currentRankIndex = get_current_role_index()

        if (currentRankIndex < groupRolesArray.length -1) {
            nextRole = groupRolesArray[currentRankIndex + 1]
        } else {
            nextRole = {name: "You are the highest rank, Chrysalis Arius Trimarch...!"}
        }

        let currentRoleIcon = roleIcons[groupRole]
        if (currentRoleIcon == null) {
            currentRoleIcon = '[-]'
        }
        let xpData = findResult.data.XP
        let xpTotalString = ''
        for (var key in xpData) {
            if (xpData.hasOwnProperty(key)) {           
                xpTotalString += `${key}: ${xpData[key]}\n`
            }
        }
     
        let xpProgressString = ""
        let CoreRankObject = await rolesCollection.find({key : 'RankRequirements'}).toArray()
        let CoreRankRequirements = CoreRankObject[0]['data']
        function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        }

        let CurrentRankRequirements = getKeyByValue(CoreRankRequirements, groupRole)
        let pathway = (findResult.data.Pathway) ? findResult.data.Pathway : "Warfare"
   
        console.log(CurrentRankRequirements)
        if (CurrentRankRequirements) {
            CurrentRankRequirements = CurrentRankRequirements[pathway]
        } else {
            xpProgressString = "Core XP is not a requirement for your next rank."
        }
        if (CurrentRankRequirements) {
            for (var key in CurrentRankRequirements) {
                if (CurrentRankRequirements.hasOwnProperty(key)) {
                    let percentage = xpData[key]/CurrentRankRequirements[key]
                    percentage = Math.ceil(percentage * 10)/10
                    let num_light = Math.ceil(percentage / 10), num_dark = 10 - num_light
                    let barTable = (barEmojis[key]) ? barEmojis[key] : barEmojis.General
                    barString = barTable['Mid']
                    barString = barTable['Start'] + barTable['Mid'].repeat(num_light - 2) + barTable['Switch'] + `${barEmojis.General.DarkMid}`.repeat(num_dark) + barEmojis.General.DarkEnd
                    xpProgressString += `${key} XP: ` + barString
                    xpProgressString += `- ${xpData[key]}/${CurrentRankRequirements[key]} **${percentage}%**\n`
                }
            }
        }
        const exampleEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle('Core XP')
			.setAuthor({ name: `${findResult.data.Username} (${findResult.key})`, url: `https://www.roblox.com/users/${userId}/profile`})
			.setDescription(`**${getCustomDisplayName()}**\nRank: ${currentRoleIcon} ${groupRole}\n`)
			.setThumbnail(thumbnail_circHeadshot)
            .addFields(
                { name: `Progress:`, value : `Pathway: ${pathway}\n${xpProgressString} \n\n ***Next Rank: ${nextRole.name}***\n`},
                { name: `Total XP:`, value : `${xpTotalString}`},
                // { name: '\u200B', value: ' ' },
                // { name: 'ARC Stats\nTracks global stats earned with the ARC gun system.', value: `\n${xpTotalString}`, inline: false },
                // { name: 'Events\nLast 5 events attended.', value: 'Some value here', inline: false },
                // { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });

		await message.channel.send({ embeds: [exampleEmbed] });
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    name: 'addxp',
    once: true,
    execute(args, message) {
        AddXP(args, message)
    }
}
