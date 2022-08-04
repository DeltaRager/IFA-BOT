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
    .setTitle(`Wiki - ${title}`)
    .setAuthor({ name: `${message.author.username}`})
    .setDescription(`${description}`)
    .setThumbnail("https://cdn.discordapp.com/avatars/"+message.author.id+"/"+message.author.avatar+".jpeg")
    .addFields(
        { name: `Caption:`, value : `${text}`},
    )
    .setFooter({ text: '#wiki <page> | Powered by AURCORE :)' });

    await message.channel.send({ embeds: [infoembed] });
}

async function info(args, message) {
    let title = ""
    let description = ""
    let text = ""
    let args_str = ""
    let underscored_str = ""
    try {
        if (!args[0]) {
            title = "#wiki options"
            description = "Use the #wiki command to quickly see link wiki pages."
            text = `
                    **Usage:**
                    \`\`\`#wiki <page?> \nExample: #wiki Aurax\`\`\``
            send(message, title, description, text)
            return
        }
        for (let index = 0; index < 5; index++) {
            if (args[index]) {
                args_str = args_str + " " + args[index]
            }
        }
        let codex_page = await bot.read(`${args_str}`);
        function edit_policy(section, len) {
            title = `${args_str}`
            underscored_str = args_str.replaceAll(/\s+(?=[^[\]]*\])/g, "_");
            underscored_str = underscored_str.replaceAll(' ', '')
            description = `[Source: ${args_str}](https://wiki.auraxis.co/wiki/${underscored_str})`
            text = codex_page.revisions[0].content
            text = section ? wiki_to_discord(text, section) : wiki_to_discord(text)
            let length = len ? len : 1000
            text = text.substring(0, length) + `...`
            send(message, title, description, text)
        }
        edit_policy(null, 300)
       
    } catch (err) {
        
        if (!underscored_str) {
            title = "Miraheze - 503 Error"
            text = `Miraheze (Auraxis Wiki's host)'s servers are offline.\n\nPlease thank Miraheze for their fabulous uptime at their Discord: https://discord.gg/beJq2KvGcn`
        } else {
            description = "Page does not exist on Auraxis Wiki"
            text = `\n***[Search for ${args_str} on Auraxis Wiki](https://wiki.auraxis.co/w/index.php?title=Special:Search&fulltext=1&search=${underscored_str})***\n\nThe page you tried to query does not exist; click on the link above to search the wiki. \n\nIf you are sure the page exists, Miraheze's servers may be down with a 503 error.`
        }
       
        send(message, title, description, text)
        console.log(err)
    }
}

module.exports = {
    name: 'wiki',
    once: true,
    execute(args, message) {
        info(args, message)
    }
}
