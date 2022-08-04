const noblox = require('noblox.js');
const { MessageEmbed, NewsChannel } = require('discord.js');
const { mwn } = require('mwn')
require('dotenv').config();


const { MongoClient, ServerApiVersion, BulkWriteResult } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL, { keepAlive: true });
const playerCollection = client.db('CORE_DATA').collection('PLAYERS')

const bot = new mwn({
    apiUrl: 'https://wiki.auraxis.co/w/api.php'
})

let replacements = {
    [`=`] : `*`,
    [`'''`] : `***`,
    [`''`] : `*`,
    [`[[`] : `[`,
    [`]]`] : `]`,
}
function wiki_to_discord(string, section) {
    let newString = string
    newString = string.split('<!-- PAGEBREAK -->')
    newString = newString[1] ? newString[1] : string

    if (section) {
        newSection = newString.split(`<!-- ${section} -->`)
        newString = newSection[1] ? newSection[1] : newString
    }

    for (const key in replacements) {
        if (replacements.hasOwnProperty(key)) {
            newString = newString.replaceAll(`${key}`, `${replacements[key]}`)
        }
    }
    newString = newString.replaceAll(/\s+(?=[^[\]]*\])/g, "_");
    newString = newString.replaceAll(`[`, `[https://wiki.auraxis.co/wiki/`)
    newString = newString.replaceAll(`]`, `)`)
    newString = newString.replaceAll(`|`, `](`)
    
    return newString
}

async function send(message, title, description, text) {
    const infoembed = new MessageEmbed()
    .setColor('#ff0000')
    .setTitle(`Info - ${title}`)
    .setAuthor({ name: `${message.author.username}`})
    .setDescription(`${description}`)
    .setThumbnail("https://cdn.discordapp.com/avatars/"+message.author.id+"/"+message.author.avatar+".jpeg")
    .addFields(
        { name: `Text`, value : `${text}`},
    )
    .setFooter({ text: '#info <document> <page> | Powered by AURCORE :)' });

    await message.channel.send({ embeds: [infoembed] });
}

async function info(args, message) {
    let title = ""
    let description = ""
    let text = ""
    try {
        if (args[0] == ("codex" || "Codex")) {
            let codex_page = await bot.read('Codex');
            if (!codex_page) {
                description = "Miraheze 503 Error"
                text = "Miraheze (Auraxis Wiki's host)'s servers are offline. Please thank Miraheze for their fabulous uptime at their Discord: https://discord.gg/beJq2KvGcn"
                send(message, title, description, text)
            }
            function send_codex(section, len) {
                title = "Codex"
                description = "[Source: Codex](https://auraxis.co/codex)"
                text = codex_page.revisions[0].content
                text = section ? wiki_to_discord(text, section) : wiki_to_discord(text)
                let length = len ? len : 1000
                text = text.substring(0, length)
                send(message, title, description, text)
            }
            if (args[1]) {
                switch (args[1]) {
                    case "Conduct":
                    case "conduct":
                    case "Code of Conduct":
                    case "Code":
                        title = "Code of Conduct"
                        let code_page = await bot.read('Code of Conduct')
                        description = "Source: [Code of Conduct](https://wiki.auraxis.co/wiki/Code_of_Conduct)"
                        function edit_policy(section, len) {
                            title = "Code of Conduct"
                            description = "[Source: Code of Conduct](https://wiki.auraxis.co/wiki/Code_of_Conduct)"
                            text = code_page.revisions[0].content
                            text = section ? wiki_to_discord(text, section) : wiki_to_discord(text)
                            let length = len ? len : 1000
                            text = text.substring(0, length)
                            send(message, title, description, text)
                        }
                        edit_policy(null, 800)
                        break;
                    case "laws":
                    case "Laws":
                        title = "Laws of Auraxis"
                        description = "Source: [Laws](https://wiki.auraxis.co/wiki/Laws)"
                        needle.get('https://wiki.auraxis.co/wiki/Laws', function(error, response) {
                            if (!error && response.statusCode == 200)
                                console.log(response.body);
                                text = response.body
                            });
                        break
                    default:
                        send_codex(args[1])
                        break;
                }
            } else {
                send_codex(null, 1000)
            //    needle.get('https://wiki.auraxis.co/wiki/codex', function(error, response) {
            //     if (error) console.log(error);
            //     if (!error && response.statusCode == 200)
            //         console.log(response.body)
            //         text = response.body
            //     });
            }
        }
        if (args[0] == 'war:pol')  {
            let codex_page = await bot.read('Warfare Event Policy');
            if (!codex_page) {
                description = "Miraheze 503 Error"
                text = "Miraheze (Auraxis Wiki's host)'s servers are offline. Please thank Miraheze for their fabulous uptime at their Discord: https://discord.gg/beJq2KvGcn"
                send(message, title, description, text)
            }
            function edit_policy(section, len) {
                title = "Warfare Policy"
                description = "[Source: Warfare Event Policy](https://wiki.auraxis.co/wiki/Warfare_Event_Policy)"
                text = codex_page.revisions[0].content
                text = section ? wiki_to_discord(text, section) : wiki_to_discord(text)
                let length = len ? len : 1000
                text = text.substring(0, length)
                send(message, title, description, text)
            }
            edit_policy(null, 800)
        }
        if (args[0] == 'duty')  {
            let codex_page = await bot.read('Code of Conduct')
            function edit_policy(section, len) {
                title = "Conduct of Duty"
                description = "[Source: Code of Conduct](https://wiki.auraxis.co/wiki/Code_of_Conduct)"
                text = codex_page.revisions[0].content
                text = section ? wiki_to_discord(text, section) : wiki_to_discord(text)
                let length = len ? len : 1000
                text = text.substring(0, length)
                send(message, title, description, text)
            }
            edit_policy("duty", 952)
        }
        if (!args[0]) {
            title = "#info options"
            description = "Use the #info command to quickly see official documents."
            text = `
                    **Usage:**
                    \`\`\`#info <document> <page?>\nExample: #info codex conduct\`\`\`
                    ***Codex***
                    Pages: Code of Conduct <conduct>, Laws <laws>`
            send(message, title, description, text)
        }
       
    } catch (err) {
        description = "Miraheze 503 Error"
        text = `Miraheze (Auraxis Wiki's host)'s servers are offline.\n\nPlease thank Miraheze for their fabulous uptime at their Discord: https://discord.gg/beJq2KvGcn`
        send(message, title, description, text)
        console.log(err)
    }
}

module.exports = {
    name: 'info',
    once: true,
    execute(args, message) {
        info(args, message)
    }
}
