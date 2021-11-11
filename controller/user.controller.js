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
        return false;
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
        };
        // Devolver
        return findUser;
    } catch (error) {
        console.error(error);
        return false;
    };
};

const USER_WAIFUS_GET = async (guild, userID) => {
    try {
        const waifus = await Waifu.find({ guild, userID })
            .sort({ updatedAt: 1 });
        return waifus;
    } catch (error) {
        console.error(error);
        return false;
    };
};

// Personalización
const USER_CUSTOM_HAREM_TITLE = async (guild, userID, newTitle) => {
    try {
        await User.updateOne({ guild, userID }, {
            "customization.haremTitle": newTitle
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    };
};

const USER_CUSTOM_HAREM_COLOR = async (guild, userID, newColor) => {
    try {
        await User.updateOne({ guild, userID }, {
            "customization.haremColor": newColor
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    };
};

module.exports = {
    USER_NEW,
    USER_GET,
    USER_WAIFUS_GET,
    USER_CUSTOM_HAREM_TITLE,
    USER_CUSTOM_HAREM_COLOR
};
