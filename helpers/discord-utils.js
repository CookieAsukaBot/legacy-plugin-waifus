const GET_AVATAR_URL = (user) => {
    let avatar = `https://cdn.discordapp.com/avatars/${user.id}`;

    // Comprobar si empieza con una "a_[checksum]"
    if (user.avatar.split("_")[0] == "a") {
        avatar += `/${user.avatar}.gif`;
        return avatar;
    } else {
        avatar += `/${user.avatar}.png`;
        return avatar;
    };
};

const FETCH_USER_BY_ID = async (bot, id) => {
    return await bot.users.fetch(id);
};

module.exports = {
    GET_AVATAR_URL,
    FETCH_USER_BY_ID
};
