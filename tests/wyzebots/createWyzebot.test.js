const wyzebotsService = require('../../wyzebots/wyzebot.service');
const db = require('../../_helpers/db');
const { expect } = require("chai");
const sinon = require("sinon");

describe("Wyzebot Create functionality", function () {
  let params;

  this.beforeEach(() => {
    params = { name: 'Wyzebot 1', power: ['Power 1','Power 2','Power 3'], 
    image_url: 'https://robohash.org/Wyzebot 1' };
  });

  this.afterEach(() => { sinon.restore(); });

  it("should successfully add a Wyzebot if wyzebot name does not exist", async function () {

    sinon.stub(db.Wyzebot, "findOne").returns(0);
    sinon.stub(db.Wyzebot.prototype, "save").returns(params);

    const wyzebot = await wyzebotsService.create(params);
    
    expect(wyzebot.name).to.equal(params.name);
    expect(wyzebot.image_url).to.equal(params.image_url);
    params.power.map((el, index) => {
      expect(wyzebot.power[index]).to.equal(el);
    });
  });

  it("should throw an error if wyzebot name already exist", async function () {
    sinon.stub(db.Wyzebot, "findOne").returns(params);
    sinon.stub(db.Wyzebot.prototype, "save").returns(params);

    await wyzebotsService.create(params)
    .catch(err => expect(err).to.equal("Name is already taken"));

  });

});