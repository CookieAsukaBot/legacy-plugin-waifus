const Discord = require('discord.js');
const Booru = require('booru');

const banned = [
    'derpibooru.org', // Furry
    'realbooru', // Real
    'hypnohub.net', // WTF?
    'e926.net', // Furry
    'e621.net' // Furry
];

const getBooru = () => {
    // Obtener
    return Object.entries(Booru.sites).map(booru => {
        // Remove shit
        if (banned.includes(booru[1].domain)) return;
        else return booru;
    });
};

const applyFilters = (options) => {
    // Aplicar filtro NSFW
    return getBooru().map(booru => {
        if (booru !== undefined && booru[1].nsfw == options.nsfw) return booru;
    });
};

const clearArray = (array) => {
    return array.filter(function (item) {
        return item !== undefined
    });
};

function randomBooru (options) {
    // Obtener boorus
    let boorus = getBooru();

    // Comprobar filtros
    if (options) boorus = applyFilters(options);

    // Limpiar array
    const cleanBoorus = clearArray(boorus);

    // Obtener uno aleatorio
    const random = cleanBoorus[Math.floor(Math.random() * cleanBoorus.length)];

    // Devolver
    return random[0].toString();
};

module.exports = {
	name: 'waifu',
	description: 'Obten un arte de una Waifu aleatoria.',
    aliases: [],
	async execute (message, args) {
        try {
            // Obtener imagen
            let res;
            if (args == "uwu") {
                res = await Booru.search(randomBooru({ nsfw: true }), [], { limit: 1, random: true });
            } else if (args == "owo") {
                res = await Booru.search(randomBooru({ nsfw: false }), [], { limit: 1, random: true });
            } else {
                res = await Booru.search('safebooru', [], { limit: 1, random: true, page: Math.floor(Math.random() * 100) });
            };
    
            // Mejorar modelo
            const image = {
                id: res.posts[0].id,
                url: res.posts[0].fileUrl,
                rating: res.posts[0].rating,
                createdAt: res.posts[0].createdAt,
                domain: res.posts[0].booru.domain,
                source: res.posts[0].source
            };

            // Agregar fuentes
            let description = `ID: ${image.id}`;
            if (image.source && Array.isArray(image.source)) description += image.source.forEach((source, index) => `[Fuente (${index + 1}/${image.source.length})](${source})`);
            if (image.source && !Array.isArray(image.source)) description = `ID: [${image.id}](${image.source})`;

            // Embed
            let embed = new Discord.MessageEmbed()
                .setColor(process.env.BOT_COLOR)
                .setAuthor(`Random Waifu para ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(description)
                .setImage(image.url)
                .setFooter(`${image.domain}`)
                .setTimestamp(image.createdAt);

            // Responder
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(err);
            message.reply(`Ocurrió un error con la API.`);
        };
	}
};
