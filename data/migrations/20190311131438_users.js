exports.up = function(knex, Promise) {
  return knex.schema.createTable("Users", tbl => {
    tbl.increments("UserID");
    tbl
      .string("UserName")
      .unique()
      .notNullable();
    tbl.string("UserPassword").notNullable();
    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("Users");
};
