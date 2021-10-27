const Discord = require('discord.js');

// Importar cosas locales
const waifuController = require('../controller/waifu.controller');
const userController = require('../controller/user.controller');
const { GET_AVATAR_URL, FETCH_USER_BY_ID } = require('../helpers/discord-utils');

// Modelos
const User = require('../models/user');

const settings = {
    cooldownClaim: 60, // segundos
    colorClaimed: '#f596ff'
};

module.exports = {
    name: 'waifu',
    category: 'Waifu',
    description: 'Obten un arte de una Waifu aleatoria.',
    aliases: ['w', 'waifus'],
    async execute (message, args, bot) {
        // Buscar usuario
        let rolledBy = await User.findOne({ userID: message.author.id, guild: message.guild.id });
        // Si no se encuentra el usuario
        if (!rolledBy) {
            // Crear perfil
            rolledBy = await userController.USER_NEW({
                id: message.author.id,
                guild: message.guild.id
            });

            // Comprobar si se creó el usuario
            if (!rolledBy) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });
        };

        // Comprobar si puede tirar
        if (!rolledBy.rolls >= 1) return message.channel.send({
            content: `<@${message.author.id}>, no tienes rolls disponibles!`
        });

        // Obtener arte Random
        let image = await waifuController.WAIFU_GET_RANDOM(message.guild.id);
        // Si ocurre un error con el arte
        if (image == false) {
            return message.channel.send({
                content: `Ocurrió un error con la API, vuelve a intentarlo.`
            });
        };

        // Actualizar rolls (desminuir)
        await User.updateOne({ userID: message.author.id, guild: message.guild.id }, {
            $inc: {
                rolls: -1,
                usedRolls: 1 // se incrementa
            }
        });

        // Embed
        let embed = new Discord.MessageEmbed()
            .setDescription(image.description)
            .setImage(image.url)
            .setFooter(`${image.domain} | ${image.id}`);

        // Comprobar si tiene dueño
        if (image.owner !== false && image.owner.guild == message.guild.id) {
            const fetchUser = await FETCH_USER_BY_ID(bot, message.author.id);
            embed.setColor(settings.colorClaimed);
            embed.setAuthor(`Waifu de ${fetchUser.username}`, GET_AVATAR_URL(fetchUser));
            message.channel.send({ embeds: [embed] });
        } else {
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
                    filter: (reaction, user) => reaction.emoji.name === '💖' && user.id !== message.client.user.id,
                    time: settings.cooldownClaim * 1000,
                    // maxEmojis: 2, // Si hay límite de reclamaciones, esto no es necesario
                    // maxUsers: 1 // Si hay límite de reclamaciones, esto no es necesario
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
                        findUser = await userController.USER_NEW({
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
                        collector.rollStatus.claimed = true;
                        // Actualizar usuario (canClaim) y detener collector
                        await User.updateOne({ userID: user.id, guild: message.guild.id }, { canClaim: false });
                        await collector.stop();
                    } else if (findUser.canClaim == false) {
                        // Responder alerta
                        message.channel.send({
                            content: `<@${findUser.userID}>, ya has reclamado, necesitas esperar al siguiente reset!`
                        });
                    };
                });

                // Al terminar el collector: Editar mensaje...
                collector.on('end', async collected => {
                    // Si el roll se ha reclamado
                    if (collector.rollStatus.claimed == true) {
                        // Guardar en la DB (reclamar)
                        const CLAIM_STATUS = await waifuController.WAIFU_CLAIM(collector.rollStatus);
                        // Comprobar si se guardó en la DB (comprobar si se reclamó)
                        if (CLAIM_STATUS == true) {
                            // Nuevo embed: estado reclamado
                            embed.setAuthor(`Waifu reclamada por ${collector.rollStatus.user.username}`, GET_AVATAR_URL(collector.rollStatus.user));
                            embed.setColor(settings.colorClaimed)
                            // Editar mensaje
                            await msg.edit({ embeds: [embed] });
                            // Enviar mensaje
                            await message.channel.send({
                                // después personalizar
                                content: `💖 ¡**${collector.rollStatus.user.username}** reclamó su waifu! 💖`
                            });
                        } else if (CLAIM_STATUS == false) {
                            // Enviar mensaje
                            await message.channel.send({
                                content: `Ocurrió un error al reclamar la Waifu en la DB. 💥`
                            });
                        };
                    };
                });
            });
        };
    }
};
