const { MessageEmbed } = require('discord.js');

// Importar cosas locales
const Waifu = require('../models/waifu');
const { USER_GET } = require('../controller/user.controller');

module.exports = {
    name: 'rolls',
    category: 'Waifu',
    description: 'Muestra el estado de tus rolls y de reclamación.',
    aliases: ['roll'],
    async execute (message) {
        // Comprobar Usuario y Waifus
        const user = await USER_GET(message);
        if (user == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });
    
        // Contadores
        const ARTS = await Waifu.countDocuments({ guild: message.guild.id, userID: message.author.id, type: "ART" });
        const WAIFUS = await Waifu.countDocuments({ guild: message.guild.id, userID: message.author.id, type: "WAIFU" });

        // Descripción
        let description = `Rolls restantes: **${user.rolls}** 🎲\n`;

        // Comprobación de reclamación
        if (user.canClaim == true) description += `Puedes reclamar: **Sí** ✅`;
        if (user.canClaim == false) description += `Puedes reclamar: **No** ❌`;
        description += `\n\nWaifus: **${WAIFUS}** 💞`;
        description += `\nArtes: **${ARTS}** 🎨`;

        // Embed
        let embed = new MessageEmbed()
            .setColor(process.env.BOT_COLOR)
            .setAuthor(`Estado de ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(description);

        // Responder
        message.channel.send({ embeds: [embed] });
    }
};
