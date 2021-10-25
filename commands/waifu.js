const Discord = require('discord.js');
const Booru = require('booru');

const bannedBoorus = [
    'derpibooru.org', // Furry
    'realbooru.com', // Real
    'hypnohub.net', // WTF?
    'e926.net', // Furry still wtf
    'e621.net', // Furry
    'tbib.org' // Furry
];

const safeBoorus = [
    'safebooru',
    'gelbooru', // has api rate problems?
    'kc'
];

const bannedTags = [
    '-uncensored', '-condom', '-pussy', '-sex', '-penis'
];

const getBooru = () => {
    // Obtener
    return Object.entries(Booru.sites).map(booru => {
        // Remove shit
        if (bannedBoorus.includes(booru[1].domain)) return;
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
    return random[1].aliases[0].toString();
};

module.exports = {
	name: 'waifu',
	description: 'Obten un arte de una Waifu aleatoria.',
    aliases: ['w', 'waifus'],
	async execute (message, args) {
        try {
            // Obtener imagen
            let res;

            switch (args.join(" ")) {
                case 'uwu':
                    res = await Booru.search(randomBooru({ nsfw: true }), [], { limit: 1, random: true });
                    break;
                case 'owo':
                    res = await Booru.search(randomBooru({ nsfw: false }), [], { limit: 1, random: true });
                    break;

                default:
                    res = await Booru.search('safebooru', [], {
                        limit: 1,
                        random: true,
                        page: Math.floor(Math.random() * 500)
                    });
                    break;
            };

            // Mejorar modelo
            const image = {
                id: res.posts[0].id,
                domain: res.posts[0].booru.domain,
                url: res.posts[0].fileUrl,
                tags: res.posts[0].tags,
                rating: res.posts[0].rating,
                source: res.posts[0].source,
                createdAt: res.posts[0].createdAt
            };

            let description = ``;
            // Agregar tags
            if (image.tags != undefined) description += `${image.tags.slice(0, 7).join(' ')}`;

            // Agregar fuentes
            // Si es un Array
            if (image.source && Array.isArray(image.source)) {
                description += image.source.forEach((source, index) =>
                    `\n[Fuente (${index + 1}/${image.source.length})](${source})`
                );
            };
            // Si es un String
            if (image.source && !Array.isArray(image.source)) {
                description += `\n[Fuente](${image.source})`;
            };

            // Embed
            let embed = new Discord.MessageEmbed()
                .setColor(process.env.BOT_COLOR)
                .setAuthor(`Random Waifu para ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(description)
                .setImage(image.url)
                .setFooter(`${image.domain} | ${image.id}`);

            // Responder
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(err);
            message.reply(`Ocurrió un error con la API.`);
        };
	}
};
