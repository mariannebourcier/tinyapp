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
// const newUser = require('./helper_functions');
// const emailFunction = require('./helper_functions');
//const generateRandomString = require('./helper_functions');

//ROUTES/ENDPOINTS
//CRUD RESTAPI
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//RENDERING ROUTES/FRONTEND

//url page -
app.get("/urls", (req, res) => {
  const user = req.cookies['user_id'];

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
//urls id short urls
app.get("/urls/:id", (req, res) => {
  const user = req.cookies['user_id'];
  const userUrls = userURLS(urlDatabase.userID);

  if (!user) {
    res.send("Login or Register to access this page.");
  }
  if (userUrls !== user) {
    res.send("Not permitted.");
  }
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
  const user = req.cookies['user_id'];
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

//delete url -
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.cookies['user_id'];
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

//login -
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };

  res.render('urls_login', templateVars);
});


//email function
const emailFunction = (email) => {
  for (let user in users) {
    const userID = users[user];
    if (userID.email === email) {
      return userID;
    }
  }
};
//login errors not working **
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailFunction(email); //function no working

  if (!user) {
    res.status(403).send("This account does not exist.");
  }
  if (user.password !== password) {
    res.status(403).send("Password incorrect.");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
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
  const email = req.body.email;
  const password = req.body.password;
  const validEmail = emailFunction();

  if (!email || !password || !validEmail) {
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
  
});


//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});