const Waifu = require('../models/waifu');
const User = require('../models/user');

const USER_NEW = async (data) => {
    try {
        // Modelo
        const user = new User({
            userID: data.id,
            guild: data.guild
        });

        // Guardar
        await user.save();

        // Responder
        return user;
    } catch (error) {
        // Mostrar por consola
        console.error({ error });
        // Responder
        return;
    };
};

module.exports = {
    USER_NEW,
};
