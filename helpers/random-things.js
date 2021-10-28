const GENERATE_RANDOM_NUMBER = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const GENERATE_RANDOM_NUMBERS = (quantity, min, max) => {
    let list = [];

    for (let index = 0; index < quantity; index++) {
        list.push(Math.floor(Math.random() * (max - min)) + min);
    };

    return list;
};

const GET_RANDOM_ITEM_FROM_ARRAY = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

module.exports = {
    GENERATE_RANDOM_NUMBER,
    GENERATE_RANDOM_NUMBERS,
    GET_RANDOM_ITEM_FROM_ARRAY
};
