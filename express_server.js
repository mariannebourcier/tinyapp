let generateRandomString = () =>  {
  return Array(6).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
};
//function to return url for user
const userURLS = (id) => {
  let urls = [];

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls = {
        shortURL: shortURL,
        longURL: urlDatabase[shortURL].longURL
      };
    }
  }
  return urls;
};

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
// const newUser = require('./helper_functions');
// const emailFunction = require('./helper_functions');
//const generateRandomString = require('./helper_functions');

//ROUTES/ENDPOINTS
//CRUD RESTAPI
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//RENDERING ROUTES/FRONTEND

//url page - /urls GET/POST
app.get("/urls", (req, res) => {
  const user = req.session['user_id'];

  if (!user) {
    res.send('Login or register to access this page.');
  }

  const urls = userURLS(user);


  const templateVars = {
    urls: urls,
    user: users['user_id']
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let userID = req.session['user_id'];

  urlDatabase[userID] = {
    longURL: req.body.longURL,
    userID: userID
  };

  res.redirect(`/urls/${shortURL}`);
});



//new url page - GET
app.get("/urls/new", (req, res) => {

  let user = req.session['user_id'];

  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = {
    user: users[user]
  };
  //being redirected to login no matter what*** Fix

  res.render("urls_new", templateVars);
});



//urls id short urls
app.get("/urls/:id", (req, res) => {
  const user = req.session['user_id'];
  const userUrls = userURLS(urlDatabase.userID);

  if (!user) {
    res.send("Login or Register to access this page.");
  }
  if (userUrls !== user) {
    res.send("Not permitted.");
  }
});



//urls/shortURL GET
app.get("/urls/:shortURL", (req, res) => {
  const user = req.session['user_id'];
  const userUrl = req.params.id;

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
  const user = req.session['user_id'];
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
    user: users[req.session['user_id']]
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
  res.session = null;
  res.redirect('/urls');
});


//registration page - GET/POST
app.get('/register', (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session['user_id']]
  };

  res.render('urls_register', templateVars);
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = hashedPassword;

  if (!email || !password) {
    return res.status(400).send({ message: "Provide email and password to register."});
  }

  const emailExists = users.find(user => user.email === email);
  if (emailExists) {
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

  //res.cookie('user_id',);
  //res.redirect('/urls');
  
});


//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});