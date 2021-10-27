const Discord = require('discord.js');

// Importar cosas locales
const { USER_GET, USER_WAIFUS_GET } = require('../controller/user.controller');

module.exports = {
    name: 'rolls',
    category: 'Waifu',
    description: 'Muestra el estado de tus rolls y de reclamación.',
    aliases: ['roll'],
    async execute (message, args) {
        // Comprobar Usuario y Waifus
        const user = await USER_GET(message);
        const waifus = await USER_WAIFUS_GET(message.author.id);
        if (user == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });

        // Descripción
        let description = `Rolls restantes: ${user.rolls} 🎲\n`;

        // Comprobación de reclamación
        if (user.canClaim == true) description += `Puedes reclamar: **Sí** ✅`;
        if (user.canClaim == false) description += `Puedes reclamar: **No** ❌`;
        description += `\n\nWaifus: ${waifus.length} 💞`;

        // Embed
        let embed = new Discord.MessageEmbed()
            .setColor(process.env.BOT_COLOR)
            .setAuthor(`Estado de ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(description);

        // Responder
        message.channel.send({ embeds: [embed] });
    }
};
