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
        let verified = false
        let findResult = await playerCollection.find({ // finds document given player discord id
            "data.DiscordId" : parseFloat(message.author.id)
        }).toArray();
       
        findResult = findResult[0]
        let template = await playerCollection.find({key : 'NewTemplate'}).toArray()
        template = template[0]

        let validTypes = []
        for (var key in template.data.XP) {
            if (template.data.XP.hasOwnProperty(key)) {           
                validTypes.push(key)
            }
        }
        // if (!args[0]) {
            
        // } else {
        //     if (isNaN(args[0])) {
        //         userId = await noblox.getIdFromUsername(args[0])
        //     } else {
        //         userId = Number(args[0])
        //     }
        // }

        // if (!userId) {
        //     userId = await noblox.getIdFromUsername(message.author.username)
        // }

        // let playerInfo = await noblox.getPlayerInfo(userId)

        if (!findResult) {
            const noPlayerEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle('Unverified Discord Account')
			.setAuthor({ name: `${message.author.username}`})
			.setDescription(`AURCORE doesn't know who you are on ROBLOX! \n\n Your Discord account is not verified to your CORE Profile. Follow the process in **#coreverify** to connect your Discord account to your ROBLOX account in our database. \n\nModifying XP is restricted to Subcenturion+ in IFA.`)
            .setThumbnail("https://cdn.discordapp.com/avatars/"+message.author.id+"/"+message.author.avatar+".jpeg")
            .addFields(
                { name: `Attempted Command:`, value : `#addxp`},
            )
            .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });

		await message.channel.send({ embeds: [noPlayerEmbed] });
        return
        }

        let userId = findResult.data.UserId

        let thumbnail_circHeadshot = await noblox.getPlayerThumbnail(userId, 420, "png", true, "Headshot")
        thumbnail_circHeadshot = thumbnail_circHeadshot[0].imageUrl

        let member = message.guild.members.cache.get()

        // function getCustomDisplayName() {
        //     if (findResult.data.CustomDisplayName != "") {
        //         return findResult.data.CustomDisplayName
        //     } else {
        //         return playerInfo.displayName
        //     }
        // }

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
        let currentRole = groupRolesArray[currentRankIndex]
        if (currentRole.rank >= 22 && groupRole != '[-] Eternal') { // player is allowed to run this command
            verified = true
        } else if (currentRole.Name == '[E] Ensign') {
            const EnsignEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle('Pending Approval')
			.setAuthor({ name: `${findResult.data.Username} (${userId})`})
			.setDescription(`Dear Ensign, \n\nThank you for logging XP! An officer will review your event soon.`)
            .setThumbnail(thumbnail_circHeadshot)
            .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });

            await message.channel.send({ embeds: [EnsignEmbed] });
            return
        } else {
            const tooLowRankEmbed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle('Unauthorized User')
			.setAuthor({ name: `${findResult.data.Username} (${userId})`})
			.setDescription(`Dear ***${groupRole}...*** \n\nYou are not authorized to change the XP of other users.\n\nWould you like to become an officer or NCO? Check out our [Departments](https://wiki.auraxis.co/wiki/Fleet_Department) page for NCO/officer applications!\n\n**Best wishes,\nAURCORE**\n\nModifying XP is restricted to Subcenturions and Centurion+.\n\nIf you believe this restriction is in error, DM deviaze.`)
            .setThumbnail(thumbnail_circHeadshot)
            .addFields(
                { name: `Attempted Command:`, value : `#addxp`},
            )
            .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });

		await message.channel.send({ embeds: [tooLowRankEmbed] });
        return
        }

        if (verified) {
            let errored = false, errorText = ""
            let xpTypes = {
                // type : amount
            }
            let users = []
            let currentRoleIcon = roleIcons[groupRole]
            if (currentRoleIcon == null) {
                currentRoleIcon = '[-]'
            }
            for (let i = 0; i < args.length; i++) {
                let regex = /:/
                if (regex.test(args[i])) {
                    let type = args[i].split(':')
                    if (type[0] && type[1]) {
                        if (validTypes.includes(type[0])) {
                             xpTypes[type[0]] = parseFloat(type[1])
                        } else {
                            errored = true
                            errorText = `${type[0]} is not a valid XP Type.`
                        }
                    } else {
                        errored = true
                        errorText = 'Invalid XP Types. Correct format is Type:amount'
                    }
                } else {
                    users.push(args[i])
                }
            }

            let failedUsers = []
            let succeededUsers = []

            for (let i = 0; i < users.length; i++) {
                let targetUserId = await noblox.getIdFromUsername(users[i])
                if (targetUserId) {
                    let targetRole = await noblox.getRankNameInGroup(3115240, targetUserId)
                    if (targetRole != 'Guest') {
                        let targetProfile = await playerCollection.find({'data.UserId' : targetUserId}).toArray()
                        targetProfile = targetProfile[0]
                        for (var key in xpTypes) {
                            if (xpTypes.hasOwnProperty(key)) {
                                // targetProfile.data.XP = {key: targetProfile.data.XP[key] + xpTypes[key]}
                                targetProfile.data.XP[`${key}`] = targetProfile.data.XP[key] + xpTypes[key]
                                // xpTotalString += `${key}: ${xpData[key]}\n`
                            }
                        }
                        try {
                            // playerCollection.insertOne(targetProfile) // update target profile???
                            // playerCollection.replaceOne({'data.UserId': targetUserId}, targetProfile).then((ans) => {
                            //     succeededUsers.push(`${targetProfile.data.Username}`)
                            //     console.log(`successfully replaced ${targetProfile.data.Username} (${targetUserId})`)
                            // })
                            await playerCollection.replaceOne({'data.UserId': targetUserId}, targetProfile)
                            succeededUsers.push(`${targetProfile.data.Username}`)
                            console.log(`successfully replaced ${targetProfile.data.Username} (${targetUserId})`)                      
                        } catch {
                            console.log("failed")
                            errored = true
                        }
                       
                    } else {
                        failedUsers.push(users[i] + ' is not in IFA.')
                    }
                } else {
                    failedUsers.push(users[i] + ' does not have a ROBLOX account.')
                }
            }
            if (!errored) {
                let succeededString = succeededUsers.join(`\n`)
                if (succeededString == '') {
                    succeededString = "No users were given XP successfully."
                }
                let failedString = failedUsers.join(`\n`)
                if (failedString == '') {
                    failedString = "All users were awarded XP successfully!"
                }
                let xpTypeString = ''
                for (var key in xpTypes) {
                    if (xpTypes.hasOwnProperty(key)) {           
                        xpTypeString += `**${key}:** ${xpTypes[key]}\n`
                    }
                }
                const exampleEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Success - XP Added')
                .setAuthor({ name: `${findResult.data.Username} (${findResult.key})`, url: `https://www.roblox.com/users/${userId}/profile`})
                .setDescription(`Rank: ${currentRoleIcon} ${groupRole} ${findResult.data.Username} has successfully added XP to the following users:`)
                .setThumbnail(thumbnail_circHeadshot)
                .addFields(
                    { name: `XP Types`, value : `${xpTypeString}`},
                    { name: 'Succeeded Users', value: `${succeededString}`, inline: true },
                    { name: 'Failed Users', value: `${failedString}`, inline: true },
                    // { name: 'Events\nLast 5 events attended.', value: 'Some value here', inline: false },
                    // { name: 'Inline field title', value: 'Some value here', inline: true },
                )
                .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });
    
            await message.channel.send({ embeds: [exampleEmbed] });
            } else {
                const erroredEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Error - XP Not Added')
                .setAuthor({ name: `${findResult.data.Username} (${findResult.key})`, url: `https://www.roblox.com/users/${userId}/profile`})
                .setDescription(`Rank: ${currentRoleIcon} ${groupRole} ${findResult.data.Username}`)
                .setThumbnail(thumbnail_circHeadshot)
                .addFields(
                    { name: `Error Message`, value : `${errorText}`},
                    // { name: 'Users', value: `\n text if work`, inline: false },
                    // { name: 'Events\nLast 5 events attended.', value: 'Some value here', inline: false },
                    // { name: 'Inline field title', value: 'Some value here', inline: true },
                )
                .setFooter({ text: 'CORE Midnight | Check out your complete profile in game!', iconURL: 'https://static.miraheze.org/auraxiswiki/c/c9/Low_res_interim.png?20220629161905' });
    
            await message.channel.send({ embeds: [erroredEmbed] });
            }
            
        }

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
