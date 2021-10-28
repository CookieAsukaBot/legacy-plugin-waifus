const { nanoid } = require('nanoid');
const Booru = require('booru');
// const Client = require('nekos.life');
// const neko = new Client();

const { GENERATE_RANDOM_NUMBER } = require('../helpers/random-things');
const { ANILIST_RANDOM_CHARACTER } = require('../helpers/api-anilist');

const Waifu = require('../models/waifu');
const User = require('../models/user');

const RANDOM_ART_SAFEBOORU = async (guild) => {
    try {
        // Query
        let query = {
            limit: 1,
            random: true,
            page: Math.floor(Math.random() * 500), // 500
            showUnavailable: true
        };

        // Petición
        let res = await Booru.search('safebooru', [], query);

        // Modelo
        let image = {
            id: res.posts[0].id,
            domain: res.posts[0].booru.domain,
            url: res.posts[0].fileUrl,
            tags: res.posts[0].tags,
            description: '',
            rating: res.posts[0].rating,
            source: res.posts[0].source,
            createdAt: res.posts[0].createdAt,
            type: "ART",
            owner: false
        };

        // Comprobar si está reclamada
        const isClaimed = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(guild, image.id, image.domain);
        if (isClaimed !== false) image.owner = isClaimed;

        // Comprobar campos
        // Agregar tags
        if (image.tags != undefined) image.description += `${image.tags.slice(0, 8).join(' ')}`;

        // Agregar fuentes
        // Si es un Array
        if (image.source && Array.isArray(image.source)) {
            image.description += image.source.forEach((source, index) =>
                `\n[Fuente (${index + 1}/${image.source.length})](${source})`
            );
        };
        // Si es un String
        if (image.source && !Array.isArray(image.source)) {
            image.description += `\n[Fuente](${image.source})`;
        };

        // Devolver
        return image;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const RANDOM_WAIFU_ANILIST = async (guild) => {
    try {
        // Petición
        const character = await ANILIST_RANDOM_CHARACTER();

        // Modelo
        let image = {
            domain: 'anilist.co',
            id: character.id,
            anime: character.media.edges[0].node.title.romaji,
            name: character.name.full,
            url: character.image.large,
            description: '',
            type: "WAIFU",
            owner: false
        };

        // Agregar nombre
        image.description += `**${image.name}**\n`;
        // Agregar anime
        image.description += `${image.anime}`;

        // Comprobar si está reclamada
        const isClaimed = await WAIFU_SEARCH_BY_ID_AND_DOMAIN(guild, image.id, image.domain);
        if (isClaimed !== false) image.owner = isClaimed;

        return image;
    } catch (error) {
        console.error(error);
        return false;
    }
};

// Roll random
const WAIFU_GET_RANDOM = async (guild) => {
    try {
        let image = false;

        switch (GENERATE_RANDOM_NUMBER(1, 2)) {
            case 1:
                image = await RANDOM_ART_SAFEBOORU(guild);
                break;
            case 2:
                image = await RANDOM_WAIFU_ANILIST(guild);
                break;
            default:
                break;
        };

        // Responder
        return image;
    } catch (error) {
        console.log(error);
        return false;
    };
};

// Buscar por id y dominio
const WAIFU_SEARCH_BY_ID_AND_DOMAIN = async (guild, id, domain) => {
    try {
        // Buscar
        const waifu = await Waifu.findOne({ "waifu.domain": domain, "waifu.id": id });
        // Si la waifu no está reclamada
        if (!waifu) return false;

        // Agrega la info extra
        let status = {
            userID: waifu.userID,
            guild
        };

        // enviar datos
        return status;
    } catch (err) {
        console.log(err);
    };
};

// Reclamar
const WAIFU_CLAIM = async (data) => {
    let status = false;

    try {
        // Modelo
        let waifu = new Waifu({
            id: nanoid(10),
            waifu: {
                domain: data.image.domain,
                id: data.image.id,
                url: data.image.url
            },
            type: data.image.type,
            userID: data.user.id,
            guild: data.guild
        });

        // Agregar datos extras
        if (data.image.anime) waifu.waifu.anime = data.image.anime;
        if (data.image.name) waifu.waifu.name = data.image.name;

        // Guardar
        await waifu.save();
        status = true;

        // Responder
        return status;
    } catch (error) {
        // Mostrar por consola
        console.error({ error });
        // Responder
        return status;
    };
};

// Divorciar
const WAIFU_DIVORCE = async (id, user) => {
    // Eliminar
    await Waifu.deleteOne({ id, userID: user })
        then(() => {
            return true;
        }).catch(error => {
            return false;
            console.error(error)
        });
};

// Regalar
const WAIFU_GIVE = async () => {};

module.exports = {
    WAIFU_GET_RANDOM,
    WAIFU_CLAIM,
    WAIFU_DIVORCE
};
