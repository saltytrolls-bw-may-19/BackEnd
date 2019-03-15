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
    testUsers.forEach(
      async user =>
        await dbHelper.registerUser({
          ...user,
          UserPassword: bcrypt.hashSync(user.UserPassword, 12)
        })
    );

  // These URL's will be reused often even in testing other endpoints
  const registerURL = "/api/users/register";
  const loginURL = "/api/users/login";

  // Clear the test DB after every test
  afterEach(() => db("Users").truncate());

  describe(`Request to "POST /api/users/register":`, () => {
    const reqURL = registerURL;

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
    const reqURL = loginURL;

    it("• should return a JSON", async () => {
      const res = await request(server).post(reqURL);
      expect(res.type).toBe("application/json");
    });

    it("• should return status 200 upon sending correct credentials", async () => {
      // Register the user first to ensure a valid login
      await request(server)
        .post(registerURL)
        .send(testUsers[0]);

      const res = await request(server)
        .post(reqURL)
        .send(testUsers[0]);
      expect(res.status).toBe(200);
    });

    it("• should return a JSON with the corresponding UserID, UserEmail and token", async () => {
      // Add the users first to ensure a valid login
      insertAllUsers();

      const res = await request(server)
        .post(reqURL)
        .send(testUsers[1]); // Get second user
      expect(res.body).toEqual({
        UserID: 2, // Should be second user's ID
        UserEmail: testUsers[1].UserEmail, // Should be second user's email address
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

  describe(`Request to "GET /api/users/auth":`, () => {
    const reqURL = "/api/users/auth";

    it("• should return a JSON", async () => {
      const res = await request(server).get(reqURL);
      expect(res.type).toBe("application/json");
    });

    it("• should return status 200 when a valid token is used", async () => {
      // Register the user first to ensure a valid login
      await request(server)
        .post(registerURL)
        .send(testUsers[0]);

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[0]);
      const token = res.body.token;

      res = await request(server)
        .get(reqURL)
        .set("Authorization", token)
        .send(testUsers[0]);
      expect(res.status).toBe(200);
    });

    it("• should return status 401 when no valid token is supplied", async () => {
      const res = await request(server)
        .get(reqURL)
        .send(testUsers[0]);
      expect(res.status).toBe(401);
    });
  });

  describe(`Request to "DELETE /api/users/:id":`, () => {
    const reqURL = "/api/users/2"; // These tests will always try to delete the 2nd user out of 3

    it("• should return a JSON", async () => {
      const res = await request(server).delete(reqURL);
      expect(res.type).toBe("application/json");
    });

    it("• should return status 200 when a valid token is used", async () => {
      // Register users first to ensure valid logins
      insertAllUsers();

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[1]);
      const token = res.body.token;

      res = await request(server)
        .delete(reqURL)
        .set("Authorization", token);
      expect(res.status).toBe(200);
    });

    it("• should actually delete the user from the database", async () => {
      // Register users first to ensure valid logins
      insertAllUsers();

      // Log in the newly registered user to obtain token
      const res = await request(server)
        .post(loginURL)
        .send(testUsers[1]);
      const token = res.body.token;

      await request(server)
        .delete(reqURL)
        .set("Authorization", token);

      const addedUser = await dbHelper.getUserById(2);
      expect(addedUser).toBeFalsy();
    });

    it("• should return status 404 when a non-existent user ID is supplied in the request URL", async () => {
      // Register a user first to ensure a valid login
      await request(server)
        .post(registerURL)
        .send(testUsers[0]);

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[0]);
      const token = res.body.token;

      // Delete the logged in user - this will simulate a possible deletion glitch occurring in the database
      await dbHelper.deleteUser(1);

      res = await request(server)
        .delete("/api/users/1")
        .set("Authorization", token);
      expect(res.status).toBe(404);
    });

    it("• should return status 403 when a logged in user attempts to delete another user (based on token data)", async () => {
      // Register a user first to ensure a valid login
      await request(server)
        .post(registerURL)
        .send(testUsers[0]);

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[0]);
      const token = res.body.token;

      res = await request(server)
        .delete(reqURL)
        .set("Authorization", token);
      expect(res.status).toBe(403);
    });

    it("• should return status 401 when no valid token is supplied", async () => {
      const res = await request(server).delete(reqURL);
      expect(res.status).toBe(401);
    });
  });

  describe(`Request to "PATCH /api/users/:id/password":`, () => {
    const reqURL = "/api/users/2/password"; // These tests will always try to update the 2nd user out of 3

    it("• should return a JSON", async () => {
      const res = await request(server).patch(reqURL);
      expect(res.type).toBe("application/json");
    });

    it("• should return status 200 when a valid token is used", async () => {
      // Register users first to ensure valid logins
      insertAllUsers();

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[1]);
      const token = res.body.token;

      res = await request(server)
        .patch(reqURL)
        .set("Authorization", token)
        .send({UserPassword: faker.internet.password()});
      expect(res.status).toBe(200);
    });

    it("• should actually update the user's password in the database", async () => {
      // Register users first to ensure valid logins
      insertAllUsers();

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[1]);
      const token = res.body.token;

      const newPassword = faker.internet.password();

      await request(server)
        .patch(reqURL)
        .set("Authorization", token)
        .send({UserPassword: newPassword});

      res = await request(server)
        .post(loginURL)
        .send({
          ...testUsers[1],
          UserPassword: newPassword
        })
      expect(res.status).toBe(200);
    });

    it("• should return status 404 when a non-existent user ID is supplied in the request URL", async () => {
      // Register a user first to ensure a valid login
      await request(server)
        .post(registerURL)
        .send(testUsers[0]);

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[0]);
      const token = res.body.token;

      // Delete the logged in user - this will simulate a possible deletion glitch occurring in the database
      await dbHelper.deleteUser(1);

      res = await request(server)
        .patch("/api/users/1/password")
        .set("Authorization", token)
        .send({UserPassword: "test"});
      expect(res.status).toBe(404);
    });

    it("• should return status 403 when a logged in user attempts to update another user (based on token data)", async () => {
      // Register a user first to ensure a valid login
      await request(server)
        .post(registerURL)
        .send(testUsers[0]);

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[0]);
      const token = res.body.token;

      res = await request(server)
        .patch(reqURL)
        .set("Authorization", token)
        .send({UserPassword: "test"});
      expect(res.status).toBe(403);
    });

    it("• should return status 401 when no valid token is supplied", async () => {
      const res = await request(server).patch(reqURL);
      expect(res.status).toBe(401);
    });

    it("• should return status 400 upon sending incomplete information", async () => {
      // Register users first to ensure valid logins
      insertAllUsers();

      // Log in the newly registered user to obtain token
      let res = await request(server)
        .post(loginURL)
        .send(testUsers[1]);
      const token = res.body.token;

      res = await request(server)
        .patch(reqURL)
        .set("Authorization", token)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
