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
let generateRandomString = () =>  {
  return Array(6).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
};

//function to retrieve user by email
const getUserByEmail = (email, database) => {
  for (let user in database) {
    const users = database[user];
    if (users.email === email) {
      return users;
    }
  }
};

//function to create new user


module.exports = { getUserByEmail,
  
  generateRandomString };