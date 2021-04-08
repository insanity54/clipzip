
const tableName = 'vtuberData';

exports.seed = async function(knex) {
  try {
    await knex.schema.dropTableIfExists(tableName);
  } finally {
    await knex.schema.createTable(tableName, (table) => {
      table.string('name');
      table.string('youtube');
      table.string('twitter');
      table.string('discord');
      table.string('tiktok');
      table.string('patreon');
      table.string('twitch');
      table.string('sharkrobot');
      table.string('cuddlyoctopus');
      table.string('streamerlinks');
      table.string('merch');
      table.string('instagram');
      table.string('booth');
      table.string('teespring');
    });
    await knex(tableName).insert([
      { 
        name: 'ironmouse', 
        youtube: 'https://www.youtube.com/channel/UChgPVLjqugDQpRLWvC7zzig', 
        twitter: 'https://twitter.com/ironmouse/', 
        discord: 'https://discord.com/invite/preciousfamily',
        tiktok: 'https://www.tiktok.com/@ironmouse?',
        patreon: 'https://www.patreon.com/ironmouse',
        twitch: 'https://www.twitch.tv/ironmouse', 
        sharkrobot: 'https://sharkrobot.com/collections/vshojo-store'
      },
      { 
        name: 'nyaners', 
        youtube: 'http://youtube.com/nyanners',
        twitter: 'http://twitter.com/nyannyanners', 
        discord: 'https://discord.gg/011H9aUMG91qDIE8I',
        patreon: 'http://patreon.com/nyanners',
        twitch: 'https://www.twitch.tv/nyanners'
      },
      { 
        name: 'projektmelody', 
        twitter: 'https://twitter.com/ProjektMelody', 
        streamerlinks: 'https://streamerlinks.com/projektmelody', 
        twitch: 'https://twitch.tv/projektmelody' 
      },
      { 
        name: 'snuffy', 
        youtube: 'https://www.youtube.com/channel/UCvRihiQZiIO9RH2HOylfQ0Q',
        twitter: 'https://twitter.com/snuffyowo',
        twitch: 'https://www.twitch.tv/snuffy',
        discord: 'https://discord.gg/snuffy',
        patreon: 'https://www.patreon.com/snuffyowo'
      },
      { 
        name: 'bunny_gif', 
        youtube: 'https://www.youtube.com/channel/UC5PThiO0PQzXM3LgASEcoTA',
        instagram: 'https://www.instagram.com/bunny_gif/',
        twitter: 'https://twitter.com/Bunny_GIF',
        discord: 'https://discord.gg/8Z2jYjc',
        cuddlyoctopus: 'https://cuddlyoctopus.com/product/bunny/'
      },
      { 
        name: 'zentreya', 
        twitch: 'https://www.twitch.tv/zentreya',
        twitter: 'https://twitter.com/zentreya',
        discord: 'https://discord.com/invite/lairofzen',
        youtube: 'http://youtube.com/c/Zentreya',
        merch: 'https://streamlabs.com/zentreya/merch'
      },
      { 
        name: 'apricot', 
        twitter: 'https://twitter.com/LichVtuber',
        twitch: 'https://twitch.tv/apricot',
        youtube: 'https://www.youtube.com/c/ApricottheLichVS'
      },
      { 
        name: 'natsumi_moe', 
        booth: 'https://the-moe-train.booth.pm/',
        teespring: 'https://teespring.com/stores/the-moe-train',
        twitter: 'https://twitter.com/Vtuber_Moe',
        twitch: 'https://www.twitch.tv/natsumi_moe',
        youtube: 'https://www.youtube.com/user/TheOtakuMoe/featured'
      },
    ])
  }
};
