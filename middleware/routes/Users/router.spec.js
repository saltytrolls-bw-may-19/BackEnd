const request = require("supertest");
const server = require("../../../server.js");
const faker = require("faker");

const db = require("../../../data/dbConfig.js");
const dbHelper = require("./dbHelper.js");

describe("Users routes:", () => {
  const testUsers = Array(3).fill().map(user => ({
    UserEmail: faker.internet.email(),
    UserPassword: faker.internet.password()
  }));
});