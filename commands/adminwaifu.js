const Booru = require('booru');
const { WAIFU_CLAIM, WAIFU_SEARCH_BY_ID_AND_DOMAIN } = require('../controller/waifu.controller');

const GIFT = async (message, args) => {
    // Comprobar si hay una mención
    const MENTION = message.mentions.members.first();
    const DOMAIN = args[1].trim(); // safebooru
    const ID = args[2].trim(); // 00000

    // Comprobar campos
    if (!MENTION) return;
    if (!DOMAIN.length) return;
    if (!ID.length) return;

    // Variables
    let RES = false;
    let IS_CLAIMED = false;
    let CLAIM_STATUS = false;

    // Comprobar domino
    switch (DOMAIN) {
        case 'safebooru.org':
            // Petición
            RES = await Booru.search('safebooru', [`id:${ID}`], {});
            // Comprobar si se encontró el post
            if (RES.posts[0].id == undefined) return message.reply('no se encontró el post.');

            // Comprobar si está reclamada
            IS_CLAIMED = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(message.guild.id, RES.posts[0].id, RES.posts[0].id);
            // Si está reclamada
            if (IS_CLAIMED !== false) return message.reply('esta Waifu está reclamada!');

            // Regalar
            CLAIM_STATUS = await WAIFU_CLAIM({
                image: {
                    domain: RES.posts[0].booru.domain,
                    id: RES.posts[0].id,
                    url: RES.posts[0].fileUrl,
                    type: "ART"
                },
                user: MENTION,
                guild: message.guild.id // GUILD
            });

            // Comprobar estado del regalo
            if (CLAIM_STATUS == false) return message.reply('ocurrió un problema en la base de datos.');

            // Responder
            message.reply(`\`${RES.posts[0].id}\` (${RES.posts[0].booru.domain}) se entregó a **${MENTION.user.tag}**!`);
            break;
        case 'danbooru.donmai.us':
            // Petición
            RES = await Booru.search('danbooru', [`id:${ID}`], {});
            // Comprobar si se encontró el post
            if (RES.posts[0].id == undefined) return message.reply('no se encontró el post.');

            // Comprobar si está reclamada
            IS_CLAIMED = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(message.guild.id, RES.posts[0].id, RES.posts[0].id);
            // Si está reclamada
            if (IS_CLAIMED !== false) return message.reply('esta Waifu está reclamada!');

            // Regalar
            CLAIM_STATUS = await WAIFU_CLAIM({
                image: {
                    domain: RES.posts[0].booru.domain,
                    id: RES.posts[0].id,
                    url: RES.posts[0].fileUrl,
                    type: "ART"
                },
                user: MENTION,
                guild: message.guild.id // GUILD
            });

            // Comprobar estado del regalo
            if (CLAIM_STATUS == false) return message.reply('ocurrió un problema en la base de datos.');

            // Responder
            message.reply(`\`${RES.posts[0].id}\` (${RES.posts[0].booru.domain}) se entregó a **${MENTION.user.tag}**!`);
            break;
        case 'gelbooru.com':
            // Petición
            RES = await Booru.search('gelbooru', [`id:${ID}`], {});
            // Comprobar si se encontró el post
            if (RES.posts[0].id == undefined) return message.reply('no se encontró el post.');

            // Comprobar si está reclamada
            IS_CLAIMED = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(message.guild.id, RES.posts[0].id, RES.posts[0].id);
            // Si está reclamada
            if (IS_CLAIMED !== false) return message.reply('esta Waifu está reclamada!');

            // Regalar
            CLAIM_STATUS = await WAIFU_CLAIM({
                image: {
                    domain: gb_res.posts[0].booru.domain,
                    id: gb_res.posts[0].id,
                    url: gb_res.posts[0].fileUrl,
                    type: "ART"
                },
                user: MENTION,
                guild: message.guild.id // GUILD
            });

            // Comprobar estado del regalo
            if (CLAIM_STATUS == false) return message.reply('ocurrió un problema en la base de datos.');

            // Responder
            message.reply(`\`${RES.posts[0].id}\` (${RES.posts[0].booru.domain}) se entregó a **${MENTION.user.tag}**!`);
            break;
        case 'anilist.co':
            break;
    
        default:
            break;
    };
};

const REMOVE = async (message, args, bot) => {
};

const HAREM = async (message, args, bot) => {
};

const RANDOM = async (message, args, bot) => {
};

const API = async (message, args, bot) => {
};

module.exports = {
    name: 'adminwaifu',
    category: 'Waifus',
    roles: ['admin'],
    args: true,
    description: 'Comando de administrador.',
    usage: '[gift]', // |remove|random|api
    aliases: ['adminwaifus'],
    async execute (message, args, bot) {
        switch (args[0]) {
            case 'gift':
                await GIFT(message, args);
                break;
            case 'remove':
                await REMOVE();
                break;
            case 'random':
                await RANDOM();
                break;
            case 'harem':
                await HAREM();
                break;
            case 'api':
                await API();
                break;

            default:
                message.reply(`ejemplo del comando \`${bot.prefix}${this.name} ${this.usage}\``);
                break;
        };
    }
};
