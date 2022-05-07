


//email function


//REQUIREMENTS
let bodyParser = require("body-parser");
let express = require("express");
let bcrypt = require('bcryptjs');

//cookie-parser
//let cookieParser = require('cookie-parser');
//cookie-session
const cookieSession = require('cookie-session');



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
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey', 'secondSecretKey'],

  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));


//registering new users
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purpleunicorn"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "sushilover"
  }
};


//functions required
//const { newUser } = require('./helper_functions');
const { getUserByEmail } = require('./helper_functions');
const { generateRandomString } = require('./helper_functions');
const { userURLS } = require('./helper_functions');

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



//urls id short urls




//urls/shortURL GET Redirect to Long URL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const userUrl = req.params.id; //?

  if (!user) {
    res.send("Login or register.");
  }
  if (userUrl !== user) {
    res.send("Not permitted.");
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
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

//edit url page

//login - GET/POST
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  res.render('urls_login', templateVars);
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = users.find(user => user.email === email);

  if (!email || !password) {
    return res.status(400).send({ message: "Provide email and password."});
  }
  if (!user) {
    return res.status(401).send({ message: "Invalid credentials."});
  }

  const passwordsMatch = bcrypt.compareSync(password, user.password);
  if (!passwordsMatch) {
    return res.status(401).send({ message: "Invalid credentials."});
  }
  
  req.session.userId = user.id;
  res.status(200).send({ message: "User logged in successfully."});

  //res.cookie("user_id", user.id);
  //res.redirect("/urls");
});


//logout - POST
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


//registration page - GET/POST
app.get('/register', (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };

  res.render('urls_register', templateVars);
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = hashedPassword;

  if (!email || !password) {
    return res.status(400).send({ message: "Provide email and password to register."});
  }
  const emailCheck = getUserByEmail(email, users[req.session.user_id]);
  //const emailExists = users.find(user => user.email === email);
  if (emailCheck) {
    return res.status(400).send({ message: "This email is already taken."});
  }

  let userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    userID,
    email,
    password: hashedPassword
  };

  users.push(newUser);
  res.status(201).send({ message: "User registered successfully.", user: newUser});

  //res.redirect('/urls');
  
});


//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});