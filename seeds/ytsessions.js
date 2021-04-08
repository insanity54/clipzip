
const tableName = 'ytsessions';

exports.seed = async function(knex) {
  try {
    await knex.schema.dropTableIfExists(tableName);
  } finally {
    await knex.schema.createTable(tableName, (table) => {
      table.string('access_token').notNullable();
      table.string('refresh_token').notNullable();
      table.string('scope').notNullable();
      table.string('token_type').notNullable();
      table.bigint('expiry_date');
      table.timestamps();
    });
  }
};
