const moment = require('moment');
moment.locale('es');

const GET_COUNTDOWN_TIME = (time) => {
    const eventTime = time.unix();
    const currentTime = moment().unix();
    const diffTime = eventTime - currentTime;
    const duration = moment.duration(diffTime * 1000, 'milliseconds');

    // Resultado
    let timeLeft = `en `;
    if (duration.minutes() == 1) timeLeft += `${duration.minutes()} minuto `;
    if (duration.minutes() > 1) timeLeft += `${duration.minutes()} minutos `;
    if (duration.seconds() > 1) timeLeft += `${duration.seconds()} segundos`;
    if (duration.seconds() == 1) timeLeft += `${duration.seconds()} segundo`;

    return timeLeft;
};

module.exports = {
    GET_COUNTDOWN_TIME
};
