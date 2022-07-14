const noblox = require('noblox.js');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL, { keepAlive: true });
const playerCollection = client.db('CORE_DATA').collection('PLAYERS')

async function ViewProfile(args, message) {
    try {
        let userId = 0

        // console.log(`${message.author}`)

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

        let divisions = {
            ["Adeptus Auraxis"] : 11874299,
            Dragonguard : 7020461,
            ["Imperial Marksmen"] : 3371562,
            Eagleguard : 6035199,
        }

        let divisionsString = ` `

        for (const division_name in divisions) {
            let found_rank = await noblox.getRankNameInGroup(divisions[division_name], userId)
            if (found_rank != "Guest") {
                divisionsString += `[${division_name}](https://www.roblox.com/groups/${divisions[division_name]}): ${found_rank} \n`;
            }
        }

        if (divisionsString.length < 15) {
            divisionsString = `**Divisions**\nNo divisions found.`
        }
        
        /*
            CORE Profile should show the following
            if it's not too much work can you setup https://discordjs.guide/interactions/buttons for pages

            Page 1 "User":
            - player username, rank, etc
            - player's location if in IFA game currently with serverid of ifa game
                -> we will have server manager and be able to send commands to servers from discord with other commands
            - player's Discord and discord id
            - xp progress bar that averages the player's completion of the requirements for the next rank?
                -> like if the next rank required 35 Combat XP and 60 Colony XP, and the plr has 20 Combat XP and 40 Colony XP it would go 
                (20 + 40)/(35+60) = 60/95 -> 63.2% with 6 🟩 and 4 ⬜ .
                -> we will have a command #xp which will go more in depth, maybe separate xp page in core profile that references the same code?

               🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜ **50.0%**
               **Next Rank:** Auxiliary (25/50 total XP)

            - player's divisions and division ranks
            page 2 "Stats"
            - ARC Stats - stats organized inline with stat name above stat value? also accuracy should have % behind value
            - Minutes - same as above
            page 3 "XP"
            - xp for next rank out out of requirements
                -> Combat:      🟥🟥🟥🟥🟥🟥⬜⬜⬜⬜
                -> Competitive: 🟧🟧🟧🟧🟧🟧⬜⬜⬜⬜
                -> Community:   🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜
                -> Leadership:  🟨🟨🟨🟨🟨⬜⬜⬜⬜⬜
            - detailed XP overview, inline like stats but shows total xp of all xp types.



            The command #xp will show xp (including the next rank xp requirements and total xp the player has)

        */
        let description = `\n` // 
        if (findResult.data.CustomDisplayName) {
            description += `\n${currentRoleIcon} ${findResult.data.CustomDisplayName}`
        } else {
            description += `\n${currentRoleIcon} ${findResult.data.Username}`
        }
        description += `\n<:robloxiconwhite:996960311536013392> [Profile](https://www.roblox.com/users/${userId}/profile)\n`

        // @deltarager todo: add discord bot verification to be added to description string
        description += `<:discordiconwhite:996961107338084412> User not verified with CORE Midnight\n\n**Rank:** ${currentRoleIcon} ***${groupRole}***` // havent done verification system yet
        // Role icon will work fine on the main IFA discord

        const userEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle(`CORE Profile - User (Page 1/4)`)
			.setAuthor({ name: `${findResult.data.Username} (${findResult.key}) 🔗`, url: `https://www.roblox.com/users/${userId}/profile`})
			.setDescription(`${description}`)
			.setThumbnail(thumbnail_circHeadshot)
            .addFields(
                { name: `Next Rank: ${nextRole.name}`, value: `\nProgress: 🟩 🟩 🟩 🟩 🟩 ⬜ ⬜ ⬜ ⬜ ⬜   **50.0%**` },
                // { name: '\u200B', value: ' ' },
                { name: 'Divisions', value: `${divisionsString}` }, 
                // { name: 'ARC Stats\nTracks global stats earned with the ARC gun system.', value: `\n${statString}`, inline: false },
                // { name: 'Events\nLast 5 events attended.', value: 'Some value here', inline: false },
                // { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });
        
        const userPageRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('xppage')
                    .setLabel('XP')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('statspage')
                    .setLabel('Stats')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('eventspage')
                    .setLabel('Events')
                    .setStyle('DANGER'),
            );
        
            const xpEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle(`CORE Profile - XP (Page 2/4)`)
			.setAuthor({ name: `${findResult.data.Username} (${findResult.key}) 🔗`, url: `https://www.roblox.com/users/${userId}/profile`})
			.setDescription(`**${groupRole} 🡒 ${nextRole.name}**`)
			.setThumbnail(thumbnail_circHeadshot)
            .addFields(
                // each field would be a type of xp?
                // { name: '\u200B', value: ' ' },
                // { name: 'ARC Stats\nTracks global stats earned with the ARC gun system.', value: `\n${statString}`, inline: false },
                // { name: 'Events\nLast 5 events attended.', value: 'Some value here', inline: false },
                { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });
        
            const xpPageRow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('userpage')
                        .setLabel('User')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('statspage')
                        .setLabel('Stats')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('eventspage')
                        .setLabel('Events')
                        .setStyle('DANGER'),
                );

		const profileMessageReference = await message.channel.send({ embeds: [userEmbed], components: [userPageRow] });

        const collector = profileMessageReference.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });
        
        // collector version 3 seconds or bust
        collector.on('collect', i => {
            if (i.user.id == message.author.id) {
                // i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                switch (i.customId) {
                    case 'xppage':
                        profileMessageReference.edit({embeds: [xpEmbed], components: [xpPageRow]})
                        break;
                    case 'userpage':
                        profileMessageReference.edit({ embeds: [userEmbed], components: [userPageRow] })
                        break;
                    default:
                        profileMessageReference.edit({ embeds: [userEmbed], components: [userPageRow] })
                        break;
                }
            } else {
                i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
        });


    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    name: 'profile',
    once: true,
    execute(args, message) {
        ViewProfile(args, message)
    }
}