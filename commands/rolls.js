const Discord = require('discord.js');

// Importar cosas locales
const userController = require('../controller/user.controller');

// Modelos
const User = require('../models/user');

module.exports = {
    name: 'rolls',
    category: 'Waifu',
    description: 'Muestra el estado de tus rolls y de reclamación.',
    async execute (message) {
        // Buscar usuario
        let findUser = await User.findOne({ userID: message.author.id, guild: message.guild.id });
        // Si no se encuentra el usuario
        if (!findUser) {
            // Crear perfil
            findUser = await userController.USER_NEW({
                id: message.author.id,
                guild: message.guild.id
            });

            // Comprobar si se creó el usuario
            if (!findUser) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });
        };

        // Descripción
        let description = `Rolls restantes: ${findUser.rolls} 🎲\n`;

        // Comprobación de reclamación
        if (findUser.canClaim == true) description += `Puedes reclamar: **Sí** ✅`;
        if (findUser.canClaim == false) description += `Puedes reclamar: **No** ❌`;

        // Embed
        let embed = new Discord.MessageEmbed()
            .setColor(process.env.BOT_COLOR)
            .setAuthor(`Estado de ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(description);

        // Responder
        message.channel.send({ embeds: [embed] });
    }
};
