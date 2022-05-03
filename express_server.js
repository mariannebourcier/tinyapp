//random shorturl
const generateRandomString = function()  {
  return Array(6).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
};
//console.log(generateRandomString());


//REQUIREMENTS
const bodyParser = require("body-parser");



const express = require("express");

//cookie-parser
const cookieParser = require('cookie-parser');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
urlDatabase["9sm5xK"];

//SETUP AND MIDDLEWARES

const app = express();
const PORT = 8080; // default port 8080


app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//ROUTES/ENDPOINTS
//CRUD RESTAPI
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//RENDERING ROUTES/FRONTEND
//compass instruction
app.get("/", (req, res) => {
  res.send("Hello!");
});
//compass instruction
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//compass instruction
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});
//new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});
//generate short url,
//**add 200 code smwr
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//urls short/long page
app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    user: users[req.cookies['user_id']],
    longURL: urlDatabase[shortURL],
    shortURL: shortURL
  };
  res.render("urls_show", templateVars);
});
//redirect to longurl
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else if (!longURL) {
    //edge case: non existent short url
    res.statusCode = 404;
    res.send("<p>404: Not found. This short URL does not exist.</p>");
  }
  //edge case: urldatabase server restarted
  //status code of redirects
});
//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});
//login **
app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.username);
  res.redirect('/urls');
});
//logout **
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//registration page
app.get('/register', (req, res) => {
  const templateVars = {user:  users[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
});

//registering new users
const users = { };
//email function
const emailFunction = (email) => {
  for (const user in users) {
    if (users[user.email] === email) {
      return true;
    }
  }
  return false;
};

app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!emailFunction(req.body.email)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
      };
      res.cookies('user_id', userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 409;
      res.send('<p>409: Already taken. The email you have entered is already linked to an account.');
    }
  }
});

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});