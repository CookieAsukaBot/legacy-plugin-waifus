const Discord = require('discord.js');

// Importar cosas locales
const { USER_GET, USER_WAIFUS_GET } = require('../controller/user.controller');

module.exports = {
    name: 'harem',
    category: 'Waifu',
    description: 'Muestra tu harem | o la de un usuario.', // wip
    async execute (message) {
        // Detectar si en args hay un usuario

        // Buscar usuario
        const user = await USER_GET(message);
        if (user == false) return message.channel.send({ content: `ocurrió un error al intentar crear tu usuario!` });

        // Buscar Waifus
        const waifus = await USER_WAIFUS_GET(message.author.id);

        // Comprobar
        if (!waifus) return message.channel.send({
            content: `<@${message.author.id}>, necesitas reclamar waifus primero!`
        });

        // Aquí empieza el desastre...
        message.reply({
            content: `El comando sigue en construcción. ⚠`
        });
    }
};
