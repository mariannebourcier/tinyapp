//REQUIREMENTS
let bodyParser = require("body-parser");
let express = require("express");

//cookie-parser
let cookieParser = require('cookie-parser');

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//urlDatabase["9sm5xK"];

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
const newUser = require('helper_functions');
const emailFunction = require('helper_functions');
const generateRandomString = require('helper_functions');



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
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});
//new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});
//generate short url,
//**add 200 code smwr
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//urls short/long page
app.get("/urls/:shortURL", (req, res) => {
  let { shortURL } = req.params;
  let templateVars = {
    user: users[req.cookies['user_id']],
    longURL: urlDatabase[shortURL],
    shortURL: shortURL
  };
  res.render("urls_show", templateVars);
});
//redirect to longurl
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];

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
app.get('/login', (req, res) => {
  let templateVars = {user:  users[req.cookies['user_id']] };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = emailFunction(email);

  if (!user) res.status(403).send("This account does not exist.");

  if (user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Password incorrect.");
  }
});


//logout **
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//registration page
app.get('/register', (req, res) => {
  let templateVars = {user:  users[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
});












app.post("/register", (req, res) => {
  if (!emailFunction(req.body.email)) {
    let newUserRegister = newUser(req.body.email, req.body.password);
    res.cookie("user_id", newUserRegister);
    res.redirect("/urls");
  } else if (emailFunction(req.body.email)) {
    res.statusCode = 409;
    res.send("409: This email is already registered. Please enter a different email.");
  } else {
    res.statusCode = 409;
    res.send("409: Field empty. Please fill the required fields.");
  }
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