const request = require("supertest");
const server = require("../../../server.js");

describe("Root URL request:", () => {
  const reqURL = "/";

  it("• should return a simple welcome page (HTML)", async () => {
    const res = await request(server).get(reqURL);
    expect(res.type).toBe("text/html");
  });

  it("• should return status 200", async () => {
    const res = await request(server).get(reqURL)
    expect(res.status).toBe(200);
  });
});
