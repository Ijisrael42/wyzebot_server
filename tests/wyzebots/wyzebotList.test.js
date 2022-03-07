const wyzebotsService = require('../../wyzebots/wyzebot.service');
const db = require('../../_helpers/db');
const { expect } = require("chai");
const sinon = require("sinon");

describe("Fetch all list of Wyzebots", function () {
  let params;

  this.beforeEach(() => {

    let wyzebot = { 
      id: '62162a68ebc7ef3810e40ed1', name: 'Wyzebot 1', power: ['Power 1','Power 2','Power 3'], 
      squad: '621629c9ebc7ef3810e40ecb', squad_name: 'Squad 1', image_url: 'https://robohash.org/Wyzebot 1',
      created_at: "2022-02-23T12:36:56.016Z"
    };
  
    params = [ wyzebot ];
  });

  this.afterEach(() => { sinon.restore(); });

  it("should successfully fetch all list of Wyzebots", async function () {

    sinon.stub(db.Wyzebot, "find").returns(params);
    const wyzebots = await wyzebotsService.getAll();
    expect(wyzebots.length).to.equal(1);

    let wyzebot = wyzebots[0];

    expect(wyzebot.id).to.equal(params[0].id);
    expect(wyzebot.name).to.equal(params[0].name);
    expect(wyzebot.image_url).to.equal(params[0].image_url);
    expect(wyzebot.squad).to.equal(params[0].squad);
    expect(wyzebot.squad_name).to.equal(params[0].squad_name);
    params[0].power.map((el, index) => {
      expect(wyzebot.power[index]).to.equal(el);
    });
  });

});