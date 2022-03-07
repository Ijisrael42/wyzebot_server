const squadsService = require('../../squads/squad.service');
const db = require('../../_helpers/db');
const { expect } = require("chai");
const sinon = require("sinon");

describe("Squad Create functionality", function () {

  it("should successfully add a Squad", async function () {

    let params = { name: 'Squad 1', wyzebots: ['62162a68ebc7ef3810e40ed1','62162d13ebc7ef3810e40eda'] };
    sinon.stub(db.Squad.prototype, "save").returns(params);

    const squad = await squadsService.create(params);
    
    expect(squad.name).to.equal(params.name);
    params.wyzebots.map((el, index) => {
      expect(squad.wyzebots[index]).to.equal(el);
    });
    sinon.restore();
  });

});