const tribesService = require('../../tribes/tribe.service');
const db = require('../../_helpers/db');
const { expect } = require("chai");
const sinon = require("sinon");

describe("Tribe Create functionality", function () {

  it("should successfully add a Tribe", async function () {

    let params = { name: 'Tribe 1', squads: ['621629c9ebc7ef3810e40ecb','62162dccebc7ef3810e40ede'] };
    sinon.stub(db.Tribe.prototype, "save").returns(params);

    const tribe = await tribesService.create(params);
    
    expect(tribe.name).to.equal(params.name);
    params.squads.map((el, index) => {
      expect(tribe.squads[index]).to.equal(el);
    });
    sinon.restore();
  });

});