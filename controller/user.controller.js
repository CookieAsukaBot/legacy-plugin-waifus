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

const USER_GET = async (message) => {
    try {
        // Buscar usuario
        let findUser = await User.findOne({ userID: message.author.id, guild: message.guild.id });
        // Si no se encuentra el usuario
        if (!findUser) {
            // Crear perfil
            findUser = await USER_NEW({
                id: message.author.id,
                guild: message.guild.id
            });

            // Comprobar si se creó el usuario
            if (!findUser) return false;
        };

        return findUser;
    } catch (error) {
        console.log(error);
        return false;
    };
};

const USER_WAIFUS_GET = async (id) => {
    try {
        const waifus = await Waifu.find({ userID: id });
        return waifus;
    } catch (error) {
        console.error(error);
        return {};
    };
};

module.exports = {
    USER_NEW,
    USER_GET,
    USER_WAIFUS_GET
};
