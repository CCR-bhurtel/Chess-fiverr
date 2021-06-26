exports.up = function(knex, Promise) { // eslint-disable-line no-unused-vars
  return knex.schema.createTable('users', function (table) {
    table.increments().primary();
    table.string('username')
    table.string('email').unique();
    table.string('password');
    table.string('avatar');
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) { // eslint-disable-line no-unused-vars
  return knex.schema.dropTable('users');
};
