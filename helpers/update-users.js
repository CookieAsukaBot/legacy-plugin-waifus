const moment = require('moment');

const User = require('../models/user');

const settings = {
    claimReset: 10, // minutes
    rollsReset: 5,  // minutes
    rollsPerReset: 7
};

const RESET_ROLLS = (bot) => {
    const time = settings.rollsReset * 60 * 1000;
    // Time left
    let actualDate = moment();
    actualDate.add(settings.rollsReset, 'minutes');
    bot.waifus_cooldown.rolls.timeLeft = actualDate;

    try {
        setInterval(async () => {
            // Agregar tiempo al waifus_cooldown
            actualDate.add(settings.rollsReset, 'minutes');
            bot.waifus_cooldown.rolls.timeLeft = actualDate;
            // Actualizar
            await User.updateMany({}, {
                rolls: settings.rollsPerReset
            });
        }, time);
    } catch (error) {
        console.error(error);
    };
};

const RESET_CLAIMS = (bot) => {
    const time = settings.claimReset * 60 * 1000;
    // Time left
    let actualDate = moment();
    actualDate.add(settings.claimReset, 'minutes');
    bot.waifus_cooldown.claims.timeLeft = actualDate;

    try {
        setInterval(async () => {
            // Agregar tiempo al waifus_cooldown
            actualDate.add(settings.claimReset, 'minutes');
            bot.waifus_cooldown.claims.timeLeft = actualDate;
            // Actualizar
            await User.updateMany({}, {
                canClaim: true
            });
        }, time);
    } catch (error) {
        console.error(error)
    };
};

const UPDATE_ALL_USERS = async (bot) => {
    bot.waifus_cooldown.rolls = {};
    bot.waifus_cooldown.claims = {};
    RESET_ROLLS(bot);
    RESET_CLAIMS(bot);
};

module.exports = {
    UPDATE_ALL_USERS
};
