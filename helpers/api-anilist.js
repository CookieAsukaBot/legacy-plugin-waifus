const axios = require('axios').default;
const url = 'https://graphql.anilist.co';

const { GENERATE_RANDOM_NUMBER, GENERATE_RANDOM_NUMBERS } = require('./random-things');

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
        ids: GENERATE_RANDOM_NUMBERS(12, 1, 246844) // hay montón de personajes
    };
    const payload = {
        query,
        variables
    };

    // Petición
    const res = await axios.post(url, payload);
    const characters = res.data.data.Page.characters;

    // Comprobar si encontró personajes
    if (characters.length == 0) return false;

    // Tomar uno aleatorio
    const character = characters[GENERATE_RANDOM_NUMBER(1, parseInt(characters.length / 2) )];

    // Responder
    return character;
};

module.exports = {
    ANILIST_RANDOM_CHARACTER
};
