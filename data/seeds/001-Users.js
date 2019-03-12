exports.seed = (knex, Promise) => {
  return (
    knex("Users")
      // Deletes ALL existing entries
      .truncate()
      .then(() =>
        // Inserts seed entries
        knex("Users").insert([
          {
            UserEmail: "user@saltytrolls.com",
            UserPassword:
              "$2a$12$UDDKseQRhFM39d4IYMD.k.yB1wmNbcsSZLPfizXcC8kztMW/kZLKG" // [plaintext] password
          },
          {
            UserEmail: "johndoe@lol.com",
            UserPassword:
              "$2a$12$UDDKseQRhFM39d4IYMD.k.yB1wmNbcsSZLPfizXcC8kztMW/kZLKG" // [plaintext] password
          },
          {
            UserEmail: "azurediamond@4kun.com",
            UserPassword:
              "$2a$12$mq17wPkfRt0vkEDku7sj3eOSMKeEl/f1GFyXGTGRMLDaK6bDHIjye" // [plaintext] 12345678
          }
        ])
      )
  );
};
