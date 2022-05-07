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

//function to return url for user
const userURLS = (user) => {
  let urls = [];

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user) {
      urls.push(shortURL);
    }
  }
  return urls;
};

// const getUserByEmail = (email, database) => {
//   return Object.values(database).find(user => user.email === email);
// }

//function to create new user


module.exports = { getUserByEmail,
  userURLS,
  generateRandomString };