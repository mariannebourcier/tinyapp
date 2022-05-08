const { assert } = require('chai');

const { getUserByEmail, userURLS } = require('../helper_functions.js');

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

const testUrls = {
  'choupi': {
    longURL: 'http://www.google.com',
    userID: 'alouette'
  },
  'mario': {
    longURL: 'http://www.facebook.com',
    userID: 'chapeau'
  },

};

describe('#userURLS', () => {
  it('should return the url that belongs to the user.', () => {
    const userUrls = userURLS('chapeau', testUrls);
    console.log("hello", userUrls);
    const expected = {
      'mario': {
        longURL: 'http://www.facebook.com',
        userID: 'chapeau'
      }
    };
    assert.deepEqual(userUrls, expected);
  });

  it('should return an empty object for a nonexistent user.', () => {
    const userUrls = userURLS('patchou', testUrls);
    assert.deepEqual(userUrls, {});
  });
});