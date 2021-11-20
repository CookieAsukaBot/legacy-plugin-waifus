const Booru = require('booru');
const { MessageEmbed } = require('discord.js');

const { WAIFU_GET_RANDOM, WAIFU_CLAIM, WAIFU_SEARCH_BY_ID_AND_DOMAIN } = require('../controller/waifu.controller');
const { USER_NEW } = require('../controller/user.controller');
const { GET_AVATAR_URL, FETCH_USER_BY_ID } = require('../helpers/discord-utils');
const { GET_COUNTDOWN_TIME } = require('../helpers/time-things');

const GIFT = async (message, args) => {
    // Comprobar si hay una mención
    const MENTION = message.mentions.members.first();
    const DOMAIN = args[1].trim(); // safebooru
    const ID = args[2].trim(); // 00000
    let serverID = args[3].trim();

    // Comprobar campos
    if (!MENTION) return;
    if (!DOMAIN.length) return;
    if (!ID.length) return;
    if (serverID.startsWith("<@")) serverID = message.guild.id;

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
            IS_CLAIMED = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(serverID, RES.posts[0].id, RES.posts[0].id);
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
                guild: serverID
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
            IS_CLAIMED = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(serverID, RES.posts[0].id, RES.posts[0].id);
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
                guild: serverID
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
            IS_CLAIMED = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(serverID, RES.posts[0].id, RES.posts[0].id);
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
                guild: serverID
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
    // Comprobar dominio
    // en el futuro?
    // if args == safebooru.org, atc..
    // if args == canclaim, todos pueden reclamar sin importar su estado

    const settings = {
        cooldownClaim: 60, // segundos
    };

    const capitalizeFirstLetter = (string) => {
        string = string.toLowerCase();
        if (string == "art") string += "e";
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Obtener arte Random
    let image = await WAIFU_GET_RANDOM(message.guild.id);
    // Si ocurre un error con el arte
    if (image == false) return message.channel.send({
        content: `Ocurrió un error con la API, vuelve a intentarlo.`
    });

    // Embed
    let embed = new MessageEmbed()
        .setDescription(image.description)
        .setImage(image.url)
        .setFooter(`${image.domain} | ${image.id}`);

    // Comprobar si tiene dueño (si la id del servidor coincide)
    if (image.owner !== false && image.owner.guild == message.guild.id) {
        const fetchUser = await FETCH_USER_BY_ID(bot, image.owner.userID);
        embed.setColor(fetchUser.customization.haremColor);
        embed.setAuthor(`${capitalizeFirstLetter(image.type)} de ${fetchUser.username}`, GET_AVATAR_URL(fetchUser));
        return message.channel.send({ embeds: [embed] });
    };

    embed.setColor(process.env.BOT_COLOR);
    embed.setAuthor(`Random Waifu para ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }));

    // Responder
    message.channel.send({
        embeds: [embed]
    }).then(async msg => {
        // Reaccionar
        await msg.react('💖');

        // Crear una colección de reacciones
        let collector = await msg.createReactionCollector({
            filter: (reaction, user) => reaction.emoji.name === '💖' && user.id !== message.client.user.id, // any reactions soon?
            time: settings.cooldownClaim * 1000,
        });

        // Crear estado
        collector.rollStatus = {
            image,
            claimed: false,
            user: null,
            guild: message.guild.id
        };

        // Captar reacciones
        collector.on('collect', async (reaction, user) => {
            // Buscar usuario en la DB
            let findUser = await User.findOne({ userID: user.id, guild: message.guild.id });

            // Comprobar si no existe
            if (!findUser) {
                // Crear perfil
                findUser = await USER_NEW({
                    id: user.id,
                    guild: message.guild.id
                });
                // Responder error
                if (!findUser) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });
            };

            // Comprobar si el usuario puede reclamar
            if (findUser.canClaim == true) {
                // Reclamar
                collector.rollStatus.user = user;
                collector.rollStatus.user.haremColor = findUser.customization.haremColor;
                collector.rollStatus.claimed = true;
                // Actualizar usuario (canClaim) y detener collector
                await User.updateOne({ userID: user.id, guild: message.guild.id }, { canClaim: false });
                await collector.stop();
            } else if (findUser.canClaim == false) {
                // Calcular tiempo
                const timeLeft = GET_COUNTDOWN_TIME(bot.waifus_cooldown.claims.timeLeft);
                // Responder alerta
                message.channel.send({
                    content: `<@${findUser.userID}>, ya has reclamado!\nEl reinicio es **${timeLeft}**.`
                });
            };
        });

        // Al terminar el collector: Editar mensaje...
        collector.on('end', async collected => {
            // Si el roll se ha reclamado
            if (collector.rollStatus.claimed == true) {
                // Guardar en la DB (reclamar)
                const CLAIM_STATUS = await WAIFU_CLAIM(collector.rollStatus);
                // Comprobar si se guardó en la DB (comprobar si se reclamó)
                if (CLAIM_STATUS == true) {
                    // Nuevo embed: estado reclamado
                    embed.setAuthor(`${capitalizeFirstLetter(collector.rollStatus.image.type)} obtenida por ${collector.rollStatus.user.username}`, GET_AVATAR_URL(collector.rollStatus.user));
                    embed.setColor(collector.rollStatus.user.haremColor);
                    // Editar mensaje
                    await msg.edit({ embeds: [embed] });
                    // Enviar mensaje
                    await msg.reply({
                        // después personalizar
                        content: `💖 ¡**${collector.rollStatus.user.username}** reclamó su ${capitalizeFirstLetter(collector.rollStatus.image.type)}! 💖`
                    });
                } else if (CLAIM_STATUS == false) {
                    // Enviar mensaje
                    await msg.reply({
                        content: `Ocurrió un error al reclamar ${capitalizeFirstLetter(collector.rollStatus.image.type)} en la DB. 💥`
                    });
                };
            };
        });
    });
};

const API = async (message, args, bot) => {
};

module.exports = {
    name: 'adminwaifu',
    category: 'Waifus',
    roles: ['admin'],
    args: true,
    description: 'Comando de administrador.',
    usage: '[gift (domain, postID, guildID, @user)]', // |remove|random|api
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
                await RANDOM(message, args, bot);
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
