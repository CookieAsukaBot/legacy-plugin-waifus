const { MessageEmbed } = require('discord.js');
const { USER_GET } = require('../controller/user.controller');
const { GET_COUNTDOWN_TIME } = require('../helpers/time-things');

module.exports = {
    name: 'timeup',
    category: 'Waifu',
    description: 'Muestra en cuánto tiempo son los reinicios.',
    aliases: ['tu', 'tiempo'],
    async execute (message, args, bot) {
        // Buscar usuario
        const user = await USER_GET(message);
        if (user == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });

        // Obtener tiempo
        const cooldownRolls = GET_COUNTDOWN_TIME(bot.waifus_cooldown.rolls.timeLeft);
        const cooldownClaims = GET_COUNTDOWN_TIME(bot.waifus_cooldown.claims.timeLeft);

        // Embed
        const DESCRIPTION = `**Rolls**: ${cooldownRolls}. 🎲\n**Reclamación**: ${cooldownClaims}. 💖`;
        let embed = new MessageEmbed()
            .setColor(user.customization.haremColor)
            .setAuthor('♻️ Próximos reinicios')
            .setDescription(DESCRIPTION);

        // Responder
        message.channel.send({
            embeds: [embed]
        });
    }
};
