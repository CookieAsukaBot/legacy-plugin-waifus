const { MessageEmbed } = require('discord.js');

// Importar cosas locales
const { USER_GET, USER_WAIFUS_GET } = require('../controller/user.controller');
const { WAIFU_DIVORCE, WAIFU_GIFT } = require('../controller/waifu.controller');

const settings = {
    duration: 240, // (segundos) 4 minutos
    color: '#fb94ff',
    // sortBy: recent?
};

module.exports = {
    name: 'harem',
    category: 'Waifu',
    description: 'Puedes ver tu harem.', // o la de un usuario.
    async execute (message, args, bot) {
        // Detectar si en args hay un usuario
        const MENTION = message.mentions.members.first();

        // Buscar usuario
        const user = await USER_GET(message);
        if (user == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });

        // Buscar Waifus
        const waifus = await USER_WAIFUS_GET(message.guild.id, message.author.id);

        // Comprobar
        if (!waifus.length) return message.channel.send({
            content: `<@${message.author.id}>, necesitas reclamar waifus primero!`
        });

        // Embed
        let embed = new MessageEmbed()
            .setColor(settings.color) // Después personalizable por el usuario
            .setAuthor(`Waifu de ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setImage(`${waifus[0].waifu.url}`)
            .setFooter(`1/${waifus.length}`);
        
        // Comprobar si es arte o personaje
        if (waifus[0].type == "ART") embed.setDescription(`${waifus[0].waifu.domain} | ${waifus[0].waifu.id}`);
        if (waifus[0].type == "WAIFU") embed.setDescription(`**${waifus[0].waifu.name}**\n${waifus[0].waifu.anime}`);

        // Responder
        message.channel.send({
            embeds: [embed]
        }).then(async msg => {
            // Comprobar cantidad de Waifus
            if (waifus.length == 1) return;

            // Contadores
            let count = 0;
            let waifusCount = waifus.length - 1;

            // Agregar reacciones
            await msg.react('⬅');
            // await msg.react('💘'); // Marcar como Arte/Waifu principal
            await msg.react('➡');
            if (!MENTION) await msg.react('🗑'); // Divorciar
            if (MENTION) await msg.react('🎁'); // Regalar

            // Collector de reacciones (derecha)
            let collectorRight = await msg.createReactionCollector({
                filter: (reaction, user) => reaction.emoji.name === '➡' && user.id !== message.client.user.id,
                idle: settings.duration * 1000, // x por 1 segundo
            });
            collectorRight.on('collect', async () => {
                count++; // Sumar al contador
                // Comprobar que no sobrepase el contador de Waifus
                if (count > waifusCount) count = 0;

                // Editar embed
                let counter = count + 1;
                embed.setImage(`${waifus[count].waifu.url}`);
                embed.setFooter(`${counter}/${waifus.length}`);
                // Comprobar si es arte o personaje
                if (waifus[count].type == "ART") embed.setDescription(`${waifus[count].waifu.domain} | ${waifus[count].waifu.id}`);
                if (waifus[count].type == "WAIFU") embed.setDescription(`**${waifus[count].waifu.name}**\n${waifus[count].waifu.anime}`);

                // Editar mensaje
                await msg.edit({ embeds: [embed] });
                // Reiniciar tiempo
            });

            // Collector de reacciones (izquierda)
            let collectorLeft = await msg.createReactionCollector({
                filter: (reaction, user) => reaction.emoji.name === '⬅' && user.id !== message.client.user.id,
                idle: settings.duration * 1000, // x por 1 segundo
            });
            collectorLeft.on('collect', async () => {
                // Restar al contador
                count = count - 1;
                // Comprobar que no sea negativo
                if (count <= -1) count = waifusCount;

                // Editar embed
                let counter = count + 1;
                embed.setImage(`${waifus[count].waifu.url}`);
                embed.setFooter(`${counter}/${waifus.length}`);
                // Comprobar si es arte o personaje
                if (waifus[count].type == "ART") embed.setDescription(`${waifus[count].waifu.domain} | ${waifus[count].waifu.id}`);
                if (waifus[count].type == "WAIFU") embed.setDescription(`**${waifus[count].waifu.name}**\n${waifus[count].waifu.anime}`);

                // Editar mensaje
                await msg.edit({ embeds: [embed] });
            });

            // Regalar
            if (MENTION) {
                // Collector de reacciones (basura)
                let collectorGift = await msg.createReactionCollector({
                    filter: (reaction, user) => reaction.emoji.name === '🎁' && user.id === message.author.id,
                    idle: settings.duration * 1000, // x por 1 segundo
                });
                collectorGift.on('collect', async (reaction, user) => {
                    const gift = await WAIFU_GIFT({
                        guild: message.guild.id,
                        userID: user.id,
                        id: waifus[count].id,
                        mention: MENTION.user.id
                    });

                    if (gift == false) {
                        // Enviar aviso
                        message.reply('ocurrió un error al intentar envíar tu regalo!');
                        // Desactivar collectors
                        await collectorRight.stop();
                        await collectorLeft.stop();
                        await collectorGift.stop();
                        return;
                    };

                    // Embed
                    let giftEmbed = new MessageEmbed()
                        .setColor('PURPLE')
                        .setAuthor(`Has regalado, ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                        .setDescription(`Tu regalo se entregó a ${MENTION.user.username}\n${waifus[count].waifu.domain} | ${waifus[count].waifu.id}`)
                        .setThumbnail(`${waifus[count].waifu.url}`)
                        .setImage('https://c.tenor.com/9VlbkbzetVUAAAAC/present-for-you.gif')
                        .setFooter(`❗ Utiliza ${bot.prefix}${this.name} para volver a mirar tu lista`);

                    // Embed
                    message.channel.send({
                        embeds: [giftEmbed]
                    });

                    // Desactivar collectors
                    await collectorRight.stop();
                    await collectorLeft.stop();
                    await collectorGift.stop();
                });
            } else {
                // Collector de reacciones (basura)
                let collectorDivorce = await msg.createReactionCollector({
                    filter: (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
                    idle: settings.duration * 1000, // x por 1 segundo
                });
                collectorDivorce.on('collect', async (reaction, user) => {
                    const divorce = await WAIFU_DIVORCE(message.guild.id, waifus[count].id, user.id);

                    // Embed
                    let divorceEmbed = new MessageEmbed()
                        .setColor('GREEN')
                        .setAuthor(`Felicidades, ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                        .setDescription(`Te has divorciado\n${waifus[count].waifu.domain} | ${waifus[count].waifu.id}`)
                        .setThumbnail(`${waifus[count].waifu.url}`)
                        .setImage('https://c.tenor.com/KuqLqBEfs6AAAAAC/huevos-a-huevo.gif')
                        .setFooter(`❗ Utiliza ${bot.prefix}${this.name} para volver a mirar tu lista`);

                    // Comprobar
                    if (divorce == false) {
                        divorceEmbed.setColor('RED');
                        divorceEmbed.setAuthor(`Oh no, ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                        divorceEmbed.setDescription('Ocurrió un error al intentar divorciarte');
                        divorceEmbed.setImage('https://c.tenor.com/DeK0sJPGEDIAAAAC/jason-bateman-con-una-chingada.gif');
                    };

                    // Embed
                    message.channel.send({
                        embeds: [divorceEmbed]
                    });

                    // Desactivar collectors
                    await collectorRight.stop();
                    await collectorLeft.stop();
                    await collectorDivorce.stop();
                });
            }
        });
    }
};
