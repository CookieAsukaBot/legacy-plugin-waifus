const { MessageEmbed } = require('discord.js');

// Importar cosas locales
const Waifu = require('../models/waifu');
const { USER_GET } = require('../controller/user.controller');

module.exports = {
    name: 'rolls',
    category: 'Waifu',
    description: 'Muestra el estado de tus rolls y de reclamaci贸n.',
    aliases: ['roll'],
    async execute (message) {
        // Comprobar Usuario y Waifus
        const user = await USER_GET(message);
        if (user == false) return message.channel.send({ content: `ocurri贸 un error al intentar crear tu usuario!` });

        // Contadores
        const ARTS = await Waifu.countDocuments({ guild: message.guild.id, userID: message.author.id, type: "ART" });
        const WAIFUS = await Waifu.countDocuments({ guild: message.guild.id, userID: message.author.id, type: "WAIFU" });

        // Descripci贸n
        let description = `Rolls restantes: **${user.rolls}** 馃幉\n`;

        // Comprobaci贸n de reclamaci贸n
        if (user.canClaim == true) description += `Puedes reclamar: **S铆** 鉁卄;
        if (user.canClaim == false) description += `Puedes reclamar: **No** 鉂宍;
        description += `\n\nWaifus: **${WAIFUS}** 馃挒`;
        description += `\nArtes: **${ARTS}** 馃帹`;

        // Embed
        let embed = new MessageEmbed()
            .setColor(user.customization.haremColor)
            .setAuthor({
                name: `Estado de ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            // .setThumbnail() // waifu principal
            .setDescription(description);

        // Responder
        message.channel.send({ embeds: [embed] });
    }
};
