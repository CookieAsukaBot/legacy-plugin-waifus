const { MessageEmbed } = require('discord.js');
const { GET_COUNTDOWN_TIME } = require('../helpers/time-things');

module.exports = {
    name: 'timeup',
    category: 'Waifu',
    description: 'Muestra en cuánto tiempo son los reinicios.',
    aliases: ['tu', 'tiempo'],
    async execute (message, args, bot) {
        // Obtener tiempo
        const cooldownRolls = GET_COUNTDOWN_TIME(bot.waifus_cooldown.rolls.timeLeft, true);
        const cooldownClaims = GET_COUNTDOWN_TIME(bot.waifus_cooldown.claims.timeLeft, true);

        // Embed
        let embed = new MessageEmbed()
            .setColor(process.env.BOT_COLOR)
            .setAuthor('Próximos reinicios')
            // .setThumbnail() // waifu principal
            .addField("Rolls", `Es ${cooldownRolls} 🎲`)
            .addField("Reclamación", `Es ${cooldownClaims} 💖`);

        // Responder
        message.channel.send({
            embeds: [embed]
        });
    }
};
