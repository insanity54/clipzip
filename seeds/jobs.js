
const tableName = 'jobs';

exports.seed = async function(knex) {
  try {
    await knex.schema.dropTableIfExists(tableName);
  } finally {
    await knex.schema.createTable(tableName, (table) => {
      table.string('channel');
      table.string('schedule');
      table.timestamps();
    });
    await knex(tableName).insert([
      { channel: 'ironmouse', schedule: '0 0 0 1 * *' },
      { channel: 'nyaners', schedule: '0 0 0 2 * *' },
      { channel: 'projektmelody', schedule: '0 0 0 3 * *' },
      { channel: 'snuffy', schedule: '0 0 0 4 * *' },
      { channel: 'bunny_gif', schedule: '0 0 0 5 * *' },
      { channel: 'zentreya', schedule: '0 0 0 6 * *' },
      { channel: 'apricot', schedule: '0 16 * * * *' },
      { channel: 'natsumi_moe', schedule: '0 0 0 8 * *' },
    ])
  }
};
