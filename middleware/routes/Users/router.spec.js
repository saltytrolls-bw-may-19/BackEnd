const request = require("supertest");
const server = require("../../../server.js");
const faker = require("faker");

const db = require("../../../data/dbConfig.js");
const dbHelper = require("./dbHelper.js");
const bcrypt = require("bcrypt");

describe("Users routes:", () => {
  const testUsers = Array(3)
    .fill()
    .map(user => ({
      UserEmail: faker.internet.email(),
      UserPassword: faker.internet.password()
    }));

  const insertAllUsers = () =>
    testUsers.forEach(user => (async () => await dbHelper.insert(user))());

  afterEach(() => db("Users").truncate());

  describe(`Request to "POST /api/users/register":`, () => {
    const reqURL = "/api/users/register";

    it("• should return a JSON", async () => {
      const res = await request(server).post(reqURL);
      expect(res.type).toBe("application/json");
    });

    it("• should return status 201", async () => {
      const res = await request(server)
        .post(reqURL)
        .send(testUsers[0]);
      expect(res.status).toBe(201);
    });

    it("• should return the corresponding success message", async () => {
      const res = await request(server)
        .post(reqURL)
        .send(testUsers[0]);
      expect(res.body).toEqual({
        msg: `${testUsers[0].UserEmail} has been registered.`
      });
    });

    it("• should actually insert the new user into the database", async () => {
      await request(server)
        .post(reqURL)
        .send(testUsers[0]);

      const addedUser = await dbHelper.getUserById(1);
      expect(addedUser.UserEmail).toBe(testUsers[0].UserEmail);
      expect(
        bcrypt.compareSync(testUsers[0].UserPassword, addedUser.UserPassword)
      ).toBeTruthy();
    });

    it("• should return status 422 upon sending incomplete information", async () => {
      const res = await request(server)
        .post(reqURL)
        .send({});
      expect(res.status).toBe(422);
    });
  });
});
