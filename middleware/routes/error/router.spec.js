const request = require("supertest");
const server = require("../../../server.js");

describe("Root URL request:", () => {
  const reqURL = "/4/0/4";

  it("• should return a JSON", async () => {
    const res = await request(server).get(reqURL);
    expect(res.type).toBe("application/json");
  });

  it("• should return status 400", async () => {
    const res = await request(server).get(reqURL)
    expect(res.status).toBe(400);
  });

  it("• should have the corresponding error message in the returned JSON", async () => {
    const retObj = {errorInfo: "Code 400 - bad request"};

    const res = await request(server).get(reqURL);
    expect(res.body).toEqual(retObj);
  });
});
