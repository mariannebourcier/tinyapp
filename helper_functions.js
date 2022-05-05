//registering new users
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//function to generate a random short URL
let generateRandomString = function()  {
  return Array(6).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
};

//function to retrieve user by email
let emailFunction = (email) => {
  for (let user in users) {
    if (user.email === email) {
      return user;
    }
  }
};

//function to create new user
let newUser = (email, password) => {
  let userId = generateRandomString();
  users[userId] = {
    userId,
    email,
    password
  };
  return userId;
};



module.exports = { newUser,
  emailFunction,
  generateRandomString };