const tribesService = require('../../tribes/tribe.service');
const db = require('../../_helpers/db');
const { expect } = require("chai");
const sinon = require("sinon");

describe("Fetch all list of Tribes", function () {
  let params;

  this.beforeEach(() => {

    let tribe = { 
      id: '62162d9eebc7ef3810e40edc', name: 'Tribe 1', created_at: "2022-02-23T12:36:56.016Z",
      squads: ['621629c9ebc7ef3810e40ecb', '62162dccebc7ef3810e40ede'],        
    };
  
    params = [ tribe ];
  });

  this.afterEach(() => { sinon.restore(); });

  it("should successfully fetch all list of Tribes", async function () {

    sinon.stub(db.Tribe, "find").returns(params);
    const tribes = await tribesService.getAll();
    expect(tribes.length).to.equal(1);

    let tribe = tribes[0];

    expect(tribe.id).to.equal(params[0].id);
    expect(tribe.name).to.equal(params[0].name);
    params[0].squads.map((el, index) => {
      expect(tribe.squads[index]).to.equal(el);
    });
  });

});