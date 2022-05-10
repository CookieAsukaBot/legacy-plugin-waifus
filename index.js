const path = require('node:path');

module.exports = {
    name: 'Waifus',
    version: '1.6.9',
    cookiebot: '1.2.0',
    description: '¡Plugin oficial para obtener artes aleatorios y reclamarlos!',
    dependencies: ['booru', 'nanoid'],
    enabled: true,
    async plugin (bot) {
        // Cargar comandos
        require('../../events/commands')(bot, path.join(__dirname, 'commands'));

        // Actualización constante de usuarios
        bot.waifus_cooldown = {};
        require('./helpers/update-users').UPDATE_ALL_USERS(bot);
    }
};
