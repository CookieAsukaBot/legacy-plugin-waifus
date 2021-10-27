const Discord = require('discord.js');

// Importar cosas locales
const userController = require('../controller/user.controller');

// Modelos
const User = require('../models/user');
const Waifu = require('../models/waifu');

module.exports = {
    name: 'harem',
    category: 'Waifu',
    description: 'Muestra tu colección | o la de un usuario.', // wip
    async execute (message, args, bot) {
        // Detectar si en args hay un usuario

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

        // Buscar Waifus
        const findWaifus = await Waifu.find({ userID: message.author.id });

        // Comprobar
        if (!findWaifus) return message.channel.send({
            content: `<@${message.author.id}>, necesitas reclamar waifus primero!`
        });

        // Aquí empieza el desastre...
        message.reply({ content: `El comando sigue en construcción.` });
    }
};
