exports.up = function(knex, Promise) {
  return knex.schema.createTable("Users", tbl => {
    tbl.increments("UserID");
    tbl
      .string("UserEmail")
      .unique()
      .notNullable();
    tbl.string("UserPassword").notNullable();
    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("Users");
};
