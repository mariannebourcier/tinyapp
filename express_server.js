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

//Homepage redirect to login - GET
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});



//View all URLS belonging to user - GET
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

//Create a short URL and redirect to short URL - POST
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




//Create a short URL page if logged in - GET
app.get("/urls/new", (req, res) => {

  let user = users[req.session.user_id];

  if (!user) {
    return res.redirect('/login');
  } else {
    const templateVars = { user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  }

});

//Short URLs to user - GET
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

//Edit URL if logged in - POST
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


//Delete URL - POST
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

//Redirect to URL - GET
app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (shortURL) {
    res.redirect(shortURL.longURL);
  } else {
    res.status(400).send({ message: "This page is nonexistent."});
  }
});

//Login - GET/POST
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
  if (!email || !password) {
    res.status(400).send({ message: "Please enter email/password."});
    return;
  }

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


//Logout - POST
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});


//Registration page - GET/POST
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render('urls_register', templateVars);
});

//const password = bcrypt.hashSync(req.body.password, 10);


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = generateRandomString();
  const emailCheck = getUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send({ message: "Fill the email/password field."});
    return;
  }

  if (!emailCheck) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = {
      userID,
      email,
      password: hashedPassword
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