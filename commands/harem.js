const { MessageEmbed } = require('discord.js');

// Importar cosas locales
const { USER_GET, USER_WAIFUS_GET } = require('../controller/user.controller');
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
    description: 'Puedes ver tu harem, regalar o divorciarte.',
    usage: '[divorciar | regalar @mención]',
    async execute (message, args, bot) {
        let action = {
            mention: false,
            divorce: false,
            gift: false
        };

        // Comprobar si hay una mención
        const MENTION = message.mentions.members.first();

        // Comprobar args
        if (args[0] == 'divorce' || args[0] == 'divorcio' || args[0] == 'divorciar') action.divorce = true;
        if (MENTION) {
            // Regalar
            if (args[0] == 'gift' || args[0] == 'give' || args[0] == 'regalo' || args[0] == 'regalar') {
                action.gift = true;
            } else {
                // Ver
                action.mention = true;
            };
        };

        // Buscar usuario
        const user = await USER_GET(message);
        if (user == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });

        // Buscar Waifus
        let waifus = false;
        if (action.mention == true) waifus = await USER_WAIFUS_GET(message.guild.id, MENTION.user.id);
        if (action.mention == false) waifus = await USER_WAIFUS_GET(message.guild.id, message.author.id);

        // Comprobar
        if (!waifus.length) return message.channel.send({
            content: `<@${message.author.id}>, no hay ninguna waifu reclamada!`
        });

        // Contadores
        let waifusCount = waifus.length - 1;
        let page = 0;

        // Embed
        let embed = new MessageEmbed()
            .setColor(settings.color) // Después personalizable por el usuario
            .setImage(`${waifus[page].waifu.url}`)
            .setFooter(`0/${waifusCount}`)
            .setTimestamp(`${waifus[page].updatedAt}`);
        // Comprobar si hay mención
        if (action.mention == true) embed.setAuthor(`Harem de ${MENTION.user.username}`, GET_AVATAR_URL(MENTION.user));
        if (action.mention == false) embed.setAuthor(`Harem de ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }));
        
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
                        message.reply(`¿Quieres **reglar** a ${MENTION.user.tag}?`)
                            .then(async msg => {
                                await msg.react('✅');
                                await msg.react('❌');
                                let collectorAccept = await msg.createReactionCollector({
                                    filter: (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id,
                                    idle: settings.duration * 1000, // x por 1 segundo
                                });
                                collectorAccept.on('collect', async () => {
                                    const gift = await WAIFU_GIFT({
                                        guild: message.guild.id,
                                        userID: user.id,
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
                                });
                                let collectorCancel = await msg.createReactionCollector({
                                    filter: (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id,
                                    idle: settings.duration * 1000, // x por 1 segundo
                                });
                                collectorCancel.on('collect', async () => {
                                    // Desactivar collectors
                                    await collectorGift.stop();
                                    await collectorAccept.stop();
                                    await collectorCancel.stop();
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
