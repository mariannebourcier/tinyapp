const { assert } = require('chai');

const { getUserByEmail } = require('../helper_functions.js');

const testUsers = {
  "mario": {
    id: "mario",
    email: "mario@123.com",
    password: "purple-monkey-dinosaur"
  },
  "choupi": {
    id: "choupi",
    email: "choupi@456.com",
    password: "dishwasher-funk"
  }
};

describe('#getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("mario@123.com", testUsers);
    assert.equal(user, testUsers.mario);
  });

  it("returns undefined with an invalid email", () => {
    const user = getUserByEmail("123", testUsers);
    assert.equal(user, undefined);
  });
});