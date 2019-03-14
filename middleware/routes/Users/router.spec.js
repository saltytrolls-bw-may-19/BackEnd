const request = require("supertest");
const server = require("../../../server.js");
const faker = require("faker");

const db = require("../../../data/dbConfig.js");
const dbHelper = require("./dbHelper.js");
const bcrypt = require("bcrypt");

describe("Users routes:", () => {
  // Generate dummy data (users) for testing
  const testUsers = Array(3)
    .fill()
    .map(user => ({
      UserEmail: faker.internet.email(),
      UserPassword: faker.internet.password()
    }));

  // Quick function for inserting all test users
  const insertAllUsers = () =>
    testUsers.forEach(user => (async () => await dbHelper.insert(user))());

  // Clear the test DB after every test
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

    it("• should return status  422 when attempting to re-register an existing user", async () => {
      // First registration attempt
      await request(server)
        .post(reqURL)
        .send(testUsers[0]);

      // Re-registration attempt
      const res = await request(server)
        .post(reqURL)
        .send(testUsers[0]);
      expect(res.status).toBe(422);
    });

    it("• should return status 400 upon sending incomplete information", async () => {
      const res = await request(server)
        .post(reqURL)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe(`Request to "POST /api/users/login":`, () => {
    const reqURL = "/api/users/login";

    it("• should return a JSON", async () => {
      const res = await request(server).post(reqURL);
      expect(res.type).toBe("application/json");
    });

    it("• should return status 200 upon sending correct credentials", async () => {
      // Register the user first to ensure a valid login
      await request(server)
        .post("/api/users/register")
        .send(testUsers[0]);

      const res = await request(server)
        .post(reqURL)
        .send(testUsers[0]);
      expect(res.status).toBe(200);
    });

    it("• should return a JSON with the corresponding UserID, UserEmail and token", async () => {
      // Add the users first to ensure a valid login
      await request(server)
        .post("/api/users/register")
        .send(testUsers[0]);

      const res = await request(server)
        .post(reqURL)
        .send(testUsers[0]);
      expect(res.body).toEqual({
        UserID: 1,
        UserEmail: testUsers[0].UserEmail,
        token: res.body.token
      });
    });

    it("• should return status 401 upon sending incorrect credentials", async () => {
      // Simply omit registration here
      const res = await request(server)
        .post(reqURL)
        .send(testUsers[0]);
      expect(res.status).toBe(401);
    });

    it("• should return status 400 upon sending incomplete information", async () => {
      const res = await request(server)
        .post(reqURL)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
