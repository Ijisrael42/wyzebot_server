const squadsService = require('../../squads/squad.service');
const db = require('../../_helpers/db');
const { expect } = require("chai");
const sinon = require("sinon");

describe("Fetch all list of Squads", function () {
  let params;

  this.beforeEach(() => {

    let squad = { 
      id: '621629c9ebc7ef3810e40ecb', name: 'Squad 1', wyzebots: ['62162a68ebc7ef3810e40ed1','62162d13ebc7ef3810e40eda'], 
      tribe: '62162d9eebc7ef3810e40edc', tribe_name: 'Tribe 1',  created_at: "2022-02-23T12:34:17.883Z"
    };
  
    params = [ squad ];
  });

  this.afterEach(() => { sinon.restore(); });

  it("should successfully fetch all list of Squads", async function () {

    sinon.stub(db.Squad, "find").returns(params);
    const squads = await squadsService.getAll();
    expect(squads.length).to.equal(1);

    let squad = squads[0];

    expect(squad.id).to.equal(params[0].id);
    expect(squad.name).to.equal(params[0].name);
    expect(squad.tribe).to.equal(params[0].tribe);
    expect(squad.tribe_name).to.equal(params[0].tribe_name);
    params[0].wyzebots.map((el, index) => {
      expect(squad.wyzebots[index]).to.equal(el);
    });
  });

});