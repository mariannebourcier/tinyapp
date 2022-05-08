//Requirements
const bodyParser = require("body-parser");
const express = require("express");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');


//Variables
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

let users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "email@email.com",
    password: "$2a$10$esU9WpE5FiI/07QQHZnhb.X5s8H8xxnRsdUBcR.BUIbGRHd1AT6sW"
  }
 
};

//Functions
const { getUserByEmail, generateRandomString, userURLS } = require('./helper_functions');
//const { newUser } = require('./helper_functions');


//Setup & Middlewares
let app = express();
let PORT = 8080; // default port 8080

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey', 'secondSecretKey'],

  maxAge: 24 * 60 * 60 * 1000
}));


//Routes/Endpoints

//Crud RestAPI
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Homepage redirect to login
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//url page - /urls GET/POST
//view all URLS - login first
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const userUrl = userURLS(user.userID, urlDatabase);
  const templateVars = {
    urls: userUrl,
    user: user
  };
  if (!user) {
    res.redirect("/login");
  }

  res.render("urls_index", templateVars);
});

//create short url/redirect to short url - log in first
app.post("/urls", (req, res) => {
  let user = users[req.session.user_id];
  if (user) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: user.userID
    };
    res.redirect(`/urls/${shortURL}`);
  }
});




//new url page - GET if log in
app.get("/urls/new", (req, res) => {

  let user = users[req.session.user_id];

  if (!user) {
    return res.redirect('/login');
  } else {
    const templateVars = { user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  }

});

//urls/shortURL GET Redirect to Long URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.user_id];
  const userUrl = userURLS(user.userID, urlDatabase);

  const templateVars = {
    urlDatabase,
    userUrl,
    shortURL,
    user
  };

  if (!urlDatabase[shortURL]) {
    res.status(400).send({ message: "This short URL is nonexistent."});
  } else if (userUrl[shortURL].userID !== user.userID) {
    res.status(400).send({ message: "Not permitted."});
  } else {
    res.render('urls_show', templateVars);
  }
});

//edit url if log in
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.user_id];
  let longURL = req.body.longURL;

  if (!user) {
    res.status(400).send({ message: "Not permitted."});
  }

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.userID
  };

  res.redirect("/urls");
});


//delete url - POST
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const userUrl = userURLS(user.userID, urlDatabase);

  if (!user) {
    res.send('Login or register.');
  }

  if (userUrl[shortURL].userID !== user.userID) {
    res.send('Not permitted.');
  }

  if (userUrl[shortURL].userID === user.userID) {
    delete urlDatabase[shortURL];
  }

  res.redirect('/urls');

});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (shortURL) {
    res.redirect(shortURL.longURL);
  } else {
    res.status(400).send({ message: "This page is nonexistent."});
  }
});

//login - GET/POST
app.get('/login', (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");
  }

  const templateVars = { user: users[req.session.user_id]};

  res.render('urls_login', templateVars);
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const passwordsMatch =  bcrypt.compareSync(password, user.password);

  if (user && passwordsMatch) {
    const userID = generateRandomString();
    users[userID] = {
      userID,
      email,
      password
    };
    req.session.user_id = users[userID].userID;
    res.redirect("/urls");
  } else {
    res.status(400).send({ message: "Invalid login."});
  }
});


//logout - POST
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});


//registration page - GET/POST
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render('urls_register', templateVars);
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  let userID = generateRandomString();
  const emailCheck = getUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send({ message: "Fill the email/password field."});
  }

  if (!emailCheck) {
    users[userID] = {
      userID,
      email,
      password
    };
    req.session.user_id = users[userID].userID;
    res.redirect("/urls");
  } else {
    res.status(400).send({ message: "Email already taken."});
  }
});


//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});