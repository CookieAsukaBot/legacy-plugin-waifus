const path = require('path');

module.exports = {
    name: 'Waifus',
    version: '1.6.3',
    cookiebot: '1.0.0',
    description: '¡Plugin oficial para obtener artes aleatorios y reclamarlos!',
    dependencies: ['booru', 'nanoid', 'canvas'],
    enabled: true,
    async plugin (bot) {
        // Cargar comandos
        const commandPath = path.join(__dirname, 'commands');
        require('../../events/commands')(bot, commandPath);

        // Actualización constante de usuarios
        bot.waifus_cooldown = {};
        require('./helpers/update-users').UPDATE_ALL_USERS(bot);
    }
};
