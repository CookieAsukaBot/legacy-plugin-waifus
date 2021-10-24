const path = require('path');

module.exports = {
    name: 'Waifus',
    version: '1.0.1',
    cookiebot: '1.0.0',
    description: '¡Plugin oficial para obtener artes aleatorios!',
    dependencies: ['booru'],
    enabled: true,
    async plugin (bot) {
        // Cargar comandos
        const commandPath = path.join(__dirname, 'commands');
        require('../../events/commands')(bot, commandPath);
    }
};
