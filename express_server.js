


//email function


//REQUIREMENTS
let bodyParser = require("body-parser");
let express = require("express");
let bcrypt = require('bcryptjs');

//cookie-parser
//let cookieParser = require('cookie-parser');
//cookie-session
const cookieSession = require('cookie-session');



let urlDatabase = {};
let users = {};


//SETUP AND MIDDLEWARES
let app = express();
let PORT = 8080; // default port 8080

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey', 'secondSecretKey'],

  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

//functions required
//const { newUser } = require('./helper_functions');
const { getUserByEmail, generateRandomString, userURLS } = require('./helper_functions');

//ROUTES/ENDPOINTS
//CRUD RESTAPI
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//RENDERING ROUTES/FRONTEND

//homepage redirect to login
app.get("/", (req, res) => {
  const user = req.session.user_id;
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
  const userUrl = userURLS(urlDatabase.userID);
  const templateVars = {
    urls: userUrl,
    user: users[req.session.user_id]
  };

  if (!user) {
    res.redirect("/login");
    //res.status(400).send({ message: "You must be logged in to access this page."});
  }

  res.render("urls_index", templateVars);
});

//redirect to short url - log in first
app.post("/urls", (req, res) => {
  let user = users[req.session.user_id];

  if (user) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      user: user
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
  const userUrl = userURLS(user);

  const templateVars = {
    urlDatabase,
    userUrl,
    shortURL,
    user
  };

  if (!urlDatabase[shortURL]) {
    res.status(400).send({ message: "This short URL is nonexistent."});
  } else if (userUrl !== user) {
    res.status(400).send({ message: "Not permitted."});
  } else {
    res.render('urls_show', templateVars);
  }
});

//edit url if log in
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.user_id];
  let longURL = urlDatabase[shortURL].longURL;

  if (user && user === urlDatabase[shortURL].user) {
    longURL = req.body.newURL;
    res.redirect("/urls");
  } else {
    res.status(400).send({ message: "Not permitted."});
  }

});


//delete url - POST
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const userUrl = urlDatabase[shortURL].userID;

  if (!user) {
    res.send('Login or register.');
  }

  if (userUrl !== user) {
    res.send('Not permitted.');
  }

  if (user === userUrl) {
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
  const user = getUserByEmail(req.body.email, users);
  const passwordsMatch = bcrypt.compareSync(password, user.password);

  if (user && passwordsMatch) {
    req.session.userId = user.id;
    res.status(200).send({ message: "User logged in successfully."});
    res.redirect("/urls");
  } else {
    res.status(400).send({ message: "Invalid login."});
  }
});


//logout - POST
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


//registration page - GET/POST
app.get('/register', (req, res) => {

  if (req.session.userID) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render('urls_register', templateVars);
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(password, 10);
  let userID = generateRandomString();
  const emailCheck = getUserByEmail(email, users);

  if (!email || !password) {
    res.status(400).send({ message: "Fill the email/password field."});
  }

  if (!emailCheck) {
    const newUser = {
      userID,
      email,
      password
    };
    users.push(newUser);
    res.redirect("/urls");
  } else {
    res.status(400).send({ message: "Email already taken."});
  }
});


//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});