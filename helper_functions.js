//Users example
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

//Function to generate a random short URL
let generateRandomString = () =>  {
  return Array(6).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
};

//Function to retrieve user by email
const getUserByEmail = (email, database) => {
  for (let user in database) {
    const users = database[user];
    if (users.email === email) {
      return users;
    }
  }
  return null;
};
//Database example
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//Function to return url for user
const userURLS = (user, urlDatabase) => {
  let urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

module.exports = { getUserByEmail,
  userURLS,
  generateRandomString };