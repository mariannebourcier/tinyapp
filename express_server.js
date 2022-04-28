//random shorturl
const generateRandomString = function()  {
  return Array(6).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
};
console.log(generateRandomString());



//REQUIREMENTS
const bodyParser = require("body-parser");


const express = require("express");

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

//ROUTES/ENDPOINTS
//CRUD RESTAPI
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//RENDERING ROUTES/FRONTEND
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    longURL: urlDatabase[shortURL],
    shortURL: shortURL
  };
  res.render("urls_show", templateVars);
});


//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});