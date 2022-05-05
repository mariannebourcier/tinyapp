let generateRandomString = () =>  {
  return Array(6).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
};

//REQUIREMENTS
let bodyParser = require("body-parser");
let express = require("express");

//cookie-parser
let cookieParser = require('cookie-parser');

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


//SETUP AND MIDDLEWARES
let app = express();
let PORT = 8080; // default port 8080

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


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

//functions required
const newUser = require('./helper_functions');
const emailFunction = require('./helper_functions');
//const generateRandomString = require('./helper_functions');

//ROUTES/ENDPOINTS
//CRUD RESTAPI
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//RENDERING ROUTES/FRONTEND

//url page -
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});

//new url page -
app.get("/urls/new", (req, res) => {
  let user = req.cookies['user_id'];
  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = {
    user: users[user]
  };
  //being redirected to login no matter what*** Fix

  res.render("urls_new", templateVars);
});

//generate short url, -
//**add 200 code ?
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let userID = req.cookies['user_id'];

  urlDatabase[userID] = {
    longURL: req.body.longURL,
    userID: userID
  };

  res.redirect(`/urls/${shortURL}`);
});

//urls short/long page => show -
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = {
    user: users[req.cookies['user_id']],
    longURL: urlDatabase[shortURL].longURL,
    shortURL: shortURL
  };
  res.render("urls_show", templateVars);
});

//redirect to longurl -
app.get("/u/:shortURL", (req, res) => {
  let shortURL = urlDatabase[req.params.shortURL];

  if (shortURL) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else if (!shortURL) {
    res.statusCode = 404;
    res.send("<p>404: Not found. This short URL does not exist.</p>");
  }
 
});

//delete url -
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//edit url page

//login -
app.get('/login', (req, res) => {
  let templateVars = {user:  users[req.cookies['user_id']] };
  res.render('urls_login', templateVars);
});
//login errors not working **
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = emailFunction(email);

  if (!user) {
    res.status(403).send("This account does not exist.");
  }
  if (user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Password incorrect.");
  }
});


//logout -
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//registration page -
app.get('/register', (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password,
    username: users[req.cookies['user_id']]
  };

  res.render('urls_register', templateVars);
});


//registration **
app.post("/register", (req, res) => {
  // if (!emailFunction(req.body.email)) {
  //   let newUserRegister = newUser(req.body.email, req.body.password);
  //   res.cookie("user_id", newUserRegister);
  //   res.redirect("/urls");
  const { email, password } = req.body;
  if (!email || !password) {
    res.statusCode = 409;
    res.send("409: There was an error with the email/password you entered.");
    res.redirect('/register');
  }
  let userID = generateRandomString();
  users[userID] = {
    userID,
    email,
    password
  };

  res.cookie('user_id', users[userID].id);
  res.redirect('/urls');
  // } else if (emailFunction(req.body.email)) {
  //   res.statusCode = 409;
  //   res.send("409: This email is already registered. Please enter a different email.");
  // } else {
  //   res.statusCode = 409;
  //   res.send("409: Field empty. Please fill the required fields.");
  // }
});

// app.post('/register', (req, res) => {
//   let userID = generateRandomString();
//   users[userID] = {
//     userID,
//     email: req.body.email,
//     password: req.body.password
//   };
//   if (req.body.email && req.body.password) {
//     res.cookie('user_id', userID);
//     res.redirect('/urls');
//   } else {
//     res.statusCode = 409;
//     res.send('<p>409: Email already taken. Please try another email.</p>');
//   }
// });

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});