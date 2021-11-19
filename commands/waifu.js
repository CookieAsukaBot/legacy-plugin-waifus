const { MessageEmbed } = require('discord.js');

// Importar cosas locales
const { WAIFU_GET_RANDOM, WAIFU_CLAIM } = require('../controller/waifu.controller');
const { USER_NEW, USER_GET } = require('../controller/user.controller');
const { GET_AVATAR_URL, FETCH_USER_BY_ID } = require('../helpers/discord-utils');
const { GET_COUNTDOWN_TIME } = require('../helpers/time-things');

// Modelos
const User = require('../models/user');

const capitalizeFirstLetter = (string) => {
    string = string.toLowerCase();
    if (string == "art") string += "e";
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const settings = {
    cooldownClaim: 60, // segundos
};

module.exports = {
    name: 'waifu',
    category: 'Waifu',
    description: 'Obten un arte de una Waifu aleatoria.',
    aliases: ['w', 'waifus'],
    cooldown: 1,
    async execute (message, args, bot) {
        // Buscar usuario
        const rolledBy = await USER_GET(message);
        if (rolledBy == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });

        // Comprobar si puede tirar
        if (rolledBy.rolls <= 0) {
            // Calcular tiempo
            const timeLeft = GET_COUNTDOWN_TIME(bot.waifus_cooldown.rolls.timeLeft);
            // Responder
            return message.channel.send({
                content: `<@${message.author.id}>, no tienes rolls disponibles!\nEl reinicio es **${timeLeft}**.`
            });
        };

        // Obtener arte Random
        let image = await WAIFU_GET_RANDOM(message.guild.id);
        // Si ocurre un error con el arte
        if (image == false) return message.channel.send({
            content: `Ocurrió un error con la API, vuelve a intentarlo.`
        });

        // Actualizar rolls (desminuir)
        await User.updateOne({ userID: message.author.id, guild: message.guild.id }, {
            $inc: {
                rolls: -1,
                usedRolls: 1 // se incrementa
            }
        }).then(async () => {
            // Mostrar aviso de últimos rolls
            if (rolledBy.rolls == 3) image.description += `\n\n⚠ quedan **2** rolls ⚠`;

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
                await msg.react('💖'); // random heart soon?

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
        }).catch(error => {
            console.error(error);
            message.reply({
                content: `ocurrió un error en la base de datos!`
            });
        });
    }
};
