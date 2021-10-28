const axios = require('axios').default;
const url = 'https://graphql.anilist.co';

const { GENERATE_RANDOM_NUMBERS, GET_RANDOM_ITEM_FROM_ARRAY } = require('./random-things');

const ANILIST_RANDOM_CHARACTER = async () => {
    const query = `
    query ($ids : [Int]) {
      Page(page: 1, perPage: 25) {
        characters(id_in: $ids, sort:FAVOURITES_DESC) {
          id
          name {
            full
          }
          image {
            large
          }
          gender
          media (perPage: 1, sort:POPULARITY_DESC) {
            edges {
              id
              node {
                title {
                  romaji
                }
              }
            }
          }
        }
      }
    }
    `;
    const variables = {
        ids: GENERATE_RANDOM_NUMBERS(25, 1, 20000) // hay montón de personajes
    };
    const payload = {
        query,
        variables
    };

    // Petición
    const res = await axios.post(url, payload);
    const characters = res.data.data.Page.characters;

    // Tomar uno aleatorio
    const character = GET_RANDOM_ITEM_FROM_ARRAY(characters);

    // Responder
    return character;
};

module.exports = {
    ANILIST_RANDOM_CHARACTER
};
