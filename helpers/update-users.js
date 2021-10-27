const User = require('../models/user');

const settings = {
    claimReset: 10, // minutes
    rollsReset: 5,  // minutes
    rollsPerReset: 8
};

const RESET_ROLLS = () => {
    try {
        setInterval(async () => {
            await User.updateMany({}, {
                rolls: settings.rollsPerReset
            });
        }, settings.rollsReset * 60 * 1000);
    } catch (error) {
        console.error(error);
    };
};

const RESET_CLAIMS = () => {
    try {
        setInterval(async () => {
            await User.updateMany({}, {
                canClaim: true
            });
        }, settings.claimReset * 60 * 1000);
    } catch (error) {
        console.error(error)
    };
};

const UPDATE_ALL_USERS = async () => {
    RESET_ROLLS();
    RESET_CLAIMS();
};

module.exports = {
    UPDATE_ALL_USERS
};
