const { MessageEmbed } = require('discord.js');

// Importar cosas locales
const { USER_GET, USER_WAIFUS_GET, USER_CUSTOM_HAREM_TITLE, USER_CUSTOM_HAREM_COLOR } = require('../controller/user.controller');
const { WAIFU_DIVORCE, WAIFU_GIFT } = require('../controller/waifu.controller');
const { GET_AVATAR_URL } = require('../helpers/discord-utils');

const settings = {
    duration: 240, // (segundos) 4 minutos
    color: '#fb94ff',
    jumpIf: 30,
    jumpInDouble: 10
    // sortBy: recent?
};

module.exports = {
    name: 'harem',
    category: 'Waifu',
    description: 'Puedes ver/modificar tu harem, regalar o divorciarte.',
    usage: '[divorciar | regalar @mención | nombre | color]',
    async execute (message, args, bot) {
        let action = {
            mention: false,
            divorce: false,
            gift: false,
            personalization: {
                haremTitle: false,
                haremColor: false
            },
            variables: {
                gift: ['gift', 'give', 'regalo', 'regalar'],
                name: ['nombre', 'name', 'title', 'titulo', 'título'],
                color: ['color'],
                divorce: ['divorce', 'divorcio', 'divorciar', 'eliminar', 'remover']
            }
        };

        // Comprobar si hay una mención
        const MENTION = message.mentions.members.first();

        // Comprobar args
        if (action.variables.name.includes(args[0])) action.personalization.haremTitle = true;
        if (action.variables.color.includes(args[0])) action.personalization.haremColor = true;
        if (action.variables.divorce.includes(args[0])) action.divorce = true;
        // Comprobar mención
        if (MENTION) {
            // Si incluye gift de argumento
            if (action.variables.gift.includes(args[0])) {
                action.gift = true;
            } else {
                // De lo contrario, solo ver su harem
                action.mention = true;
            };
        };

        // Buscar usuario
        const user = await USER_GET(message);
        if (user == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });

        // Buscar Waifus
        let waifus = false;
        let mentionInfo;
        if (action.mention == true) {
            mentionInfo = await USER_GET({ author: { id: MENTION.user.id }, guild: { id: message.guild.id } });
            waifus = await USER_WAIFUS_GET(message.guild.id, MENTION.user.id);
        } else {
            waifus = await USER_WAIFUS_GET(message.guild.id, message.author.id)
        };

        // Comprobar
        if (!waifus.length) return message.channel.send({
            content: `<@${message.author.id}>, no hay ninguna waifu reclamada!`
        });

        // Comprobar personalización
        let userCustomizationError = "Para cambiar el __%action%__ de tu **Harem** necesitas de agregar un __%action%__. <:redTick:908190230694207488>";
        let userCustomizationTitleError = "Has superado el **límite de caracteres** del título para tu **Harem** (__se permite 50 caracteres como máximo__). <:redTick:908190230694207488>";
        let userCustomizationSuccess = "Se guardó el **%action%** para tu **Harem**. <:greenTick:908190230731980850>";
        if (action.personalization.haremTitle) {
            // Obtener
            const getTitle = args.join(" ").split(args[0])[1].trim(); // Remueve el primer arg[0] (name/hombre)
            // Comprobar
            if (getTitle.length <= 0) return message.reply(userCustomizationError.replace(/%action%/g, "título"));
            if (getTitle.length > 50) return message.reply(userCustomizationTitleError);
            // Actualizar
            await USER_CUSTOM_HAREM_TITLE(message.guild.id, message.author.id, getTitle);
            // Responder
            return message.reply(userCustomizationSuccess.replace("%action%", "título"));
        };
        if (action.personalization.haremColor) {
            // Obtener
            const getColor = args[1];
            // Comprobar
            if (getColor.length <= 0) return message.reply(userCustomizationError.replace(/%action%/g, "color"));
            // Actualizar
            await USER_CUSTOM_HAREM_COLOR(message.guild.id, message.author.id, getColor);
            // Responder
            return message.reply(userCustomizationSuccess.replace("%action%", "color"));
        };

        // Contadores
        let waifusCount = waifus.length - 1;
        let page = 0;

        // Embed
        let embed = new MessageEmbed()
            .setColor(settings.color)
            .setImage(`${waifus[page].waifu.url}`)
            .setFooter(`0/${waifusCount}`)
            .setTimestamp(`${waifus[page].updatedAt}`);
        // Comprobar si hay mención
        if (action.mention == true) {
            embed.setColor(mentionInfo.customization.haremColor);
            embed.setAuthor(mentionInfo.customization.haremTitle, GET_AVATAR_URL(MENTION.user));
        };
        if (action.mention == false) {
            embed.setColor(user.customization.haremColor);
            embed.setAuthor(user.customization.haremTitle, message.author.displayAvatarURL({ dynamic: true }));
        };


        // Comprobar si es arte o personaje
        if (waifus[page].type == "ART") embed.setDescription(`${waifus[page].waifu.domain} | ${waifus[page].waifu.id}`);
        if (waifus[page].type == "WAIFU") embed.setDescription(`**${waifus[page].waifu.name}**\n${waifus[page].waifu.anime}`);

        // Responder
        message.channel.send({
            embeds: [embed]
        }).then(async msg => {
            // Comprobar cantidad de Waifus
            if (waifus.length == 1) return;

            // Agregar reacciones
            if (waifus.length >= settings.jumpIf) await msg.react('⏪');
            await msg.react('⬅');
            await msg.react('➡');
            if (waifus.length >= settings.jumpIf) await msg.react('⏩');

            // Agregar Acciones
            if (action.divorce == true) await msg.react('🗑'); // Divorciar
            if (action.gift == true) await msg.react('🎁'); // Regalar
            // await msg.react('💘'); // Marcar como Arte/Waifu principal


            // Collector de reacciones (derecha/izquierda)
            let collectorArrows = await msg.createReactionCollector({
                filter: (reaction, user) => (reaction.emoji.name === '⏪' || reaction.emoji.name === '⬅' || reaction.emoji.name === '➡' || reaction.emoji.name === '⏩') && user.id !== message.client.user.id,
                idle: settings.duration * 1000, // x por 1 segundo
            });
            collectorArrows.on('collect', async (reaction) => {
                // Derecha
                if (reaction.emoji.name === "➡") {
                    page = page + 1; // Sumar al contador
                    // Comprobar que no sobrepase el contador de Waifus
                    if (page > waifusCount) page = 0;
                };
                if (reaction.emoji.name === "⏩") {
                    page = page + settings.jumpInDouble; // Sumar al contador
                    // Comprobar que no sobrepase el contador de Waifus
                    if (page > waifusCount) page = 0;
                };

                // Izquierda
                if (reaction.emoji.name === "⬅") {
                    // Restar al contador
                    page = page - 1;
                    // Comprobar que no sea negativo
                    if (page <= -1) page = waifusCount;
                };
                if (reaction.emoji.name === "⏪") {
                    // Restar al contador
                    page = page - settings.jumpInDouble;
                    // Comprobar que no sea negativo
                    if (page <= -1) page = waifusCount;
                };

                // Editar embed
                embed.setImage(`${waifus[page].waifu.url}`);
                embed.setFooter(`${page}/${waifusCount}`);
                embed.setTimestamp(`${waifus[page].updatedAt}`);
                // Comprobar si es arte o personaje
                if (waifus[page].type == "ART") embed.setDescription(`${waifus[page].waifu.domain} | ${waifus[page].waifu.id}`);
                if (waifus[page].type == "WAIFU") embed.setDescription(`**${waifus[page].waifu.name}**\n${waifus[page].waifu.anime}`);

                // Editar mensaje
                await msg.edit({ embeds: [embed] });
            });
            collectorArrows.on('end', async () => await msg.reactions.removeAll());

            // Acciones
            switch (true) {
                case action.divorce == true:
                    // Collector de reacciones
                    let collectorDivorce = await msg.createReactionCollector({
                        filter: (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
                        idle: settings.duration * 2000, // x por 2 segundo
                    });
                    collectorDivorce.on('collect', async (reaction, user) => {
                        // Desactivar collectors
                        await collectorArrows.stop();

                        // Embed
                        let divorceEmbed = new MessageEmbed()
                            .setColor('GREEN')
                            .setAuthor(`Felicidades, ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                            .setDescription(`Te has divorciado\n${waifus[page].waifu.domain} | ${waifus[page].waifu.id}`)
                            .setThumbnail(`${waifus[page].waifu.url}`)
                            .setImage('https://c.tenor.com/KuqLqBEfs6AAAAAC/huevos-a-huevo.gif')
                            .setFooter(`❗ Utiliza ${bot.prefix}${this.name} para volver a mirar tu lista`);

                        // Enviar confirmación
                        message.reply('¿Quieres **divorciarte**?')
                            .then(async msg => {
                                await msg.react('✅');
                                await msg.react('❌');
                                let collectorAccept = await msg.createReactionCollector({
                                    filter: (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id,
                                    idle: settings.duration * 1000, // x por 1 segundo
                                });
                                collectorAccept.on('collect', async () => {
                                    // Divorciar
                                    const divorce = await WAIFU_DIVORCE(message.guild.id, waifus[page].id, user.id);
                                    // Comprobar
                                    if (divorce == false) {
                                        divorceEmbed.setColor('RED');
                                        divorceEmbed.setAuthor(`Oh no, ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                                        divorceEmbed.setDescription('Ocurrió un error al intentar divorciarte');
                                        divorceEmbed.setImage('https://c.tenor.com/DeK0sJPGEDIAAAAC/jason-bateman-con-una-chingada.gif');
                                    };

                                    // Respodner
                                    message.channel.send({
                                        embeds: [divorceEmbed]
                                    });

                                    await collectorCancel.stop();
                                    await collectorAccept.stop();
                                });
                                let collectorCancel = await msg.createReactionCollector({
                                    filter: (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id,
                                    idle: settings.duration * 1000, // x por 1 segundo
                                });
                                collectorCancel.on('collect', async () => {
                                    // Desactivar collectors
                                    await collectorAccept.stop();
                                    await collectorCancel.stop();
                                });
                                // Desacivar collector (probablemente bug)
                                await collectorDivorce.stop();
                            });
                    });
                    break;
                case action.gift == true:
                    // Collector de reacciones (regalar)
                    let collectorGift = await msg.createReactionCollector({
                        filter: (reaction, user) => reaction.emoji.name === '🎁' && user.id === message.author.id,
                        idle: settings.duration * 2000, // x por 2 segundo
                    });
                    collectorGift.on('collect', async (reaction, user) => {
                        // Desactivar collectors
                        await collectorArrows.stop();

                        // Embed
                        let giftEmbed = new MessageEmbed()
                            .setColor('PURPLE')
                            .setAuthor(`Has regalado, ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                            .setDescription(`Tu regalo se entregó a **${MENTION.user.username}**\n${waifus[page].waifu.domain} | ${waifus[page].waifu.id}`)
                            .setThumbnail(`${waifus[page].waifu.url}`)
                            .setImage('https://c.tenor.com/9VlbkbzetVUAAAAC/present-for-you.gif')
                            .setFooter(`❗ Utiliza ${bot.prefix}${this.name} para volver a mirar tu lista`);

                        // Enviar confirmación
                        let usersGift = [];
                        let usersCancelGift = [];
                        message.reply(`¿Quieres **regalar** a ${MENTION.user.tag}?\nSe requiere que de **ambos confirmen** el regalo.`)
                            .then(async msg => {
                                await msg.react('✅');
                                await msg.react('❌');
                                let collectorAccept = await msg.createReactionCollector({
                                    filter: (reaction, user) => reaction.emoji.name === '✅' && user.id !== message.client.user.id,
                                    idle: settings.duration * 1000, // x por 1 segundo
                                });
                                collectorAccept.on('collect', async (reaction, user) => {
                                    usersGift.push(user.id);
                                    if (usersGift.includes(message.author.id) && usersGift.includes(MENTION.user.id)) {
                                        const gift = await WAIFU_GIFT({
                                            guild: message.guild.id,
                                            userID: message.author.id,
                                            id: waifus[page].id,
                                            mention: MENTION.user.id
                                        });

                                        if (gift == false) {
                                            // Enviar aviso
                                            message.reply('ocurrió un error al intentar envíar tu regalo!');
                                            // Desactivar collectors
                                            await collectorArrows.stop();
                                            return;
                                        };

                                        // Embed
                                        message.channel.send({
                                            embeds: [giftEmbed]
                                        });

                                        // Desactivar collectors
                                        await collectorCancel.stop();
                                        await collectorAccept.stop();
                                    };
                                });
                                let collectorCancel = await msg.createReactionCollector({
                                    filter: (reaction, user) => reaction.emoji.name === '❌' && user.id !== message.client.user.id,
                                    idle: settings.duration * 1000, // x por 1 segundo
                                });
                                collectorCancel.on('collect', async (reaction, user) => {
                                    usersCancelGift.push(user.id);
                                    if (usersCancelGift.includes(message.author.id) || usersCancelGift.includes(MENTION.user.id)) {
                                        message.channel.send({
                                            content: `${message.author.tag} & ${MENTION.user.tag}, **se canceló** el regalo.`
                                        });
                                        // Desactivar collectors
                                        await collectorGift.stop();
                                        await collectorAccept.stop();
                                        await collectorCancel.stop();
                                    };
                                });
                                // Desactivar collector
                                await collectorGift.stop();
                            });

                    });
                    break;
                default:
                    break;
            };
        });
    }
};
