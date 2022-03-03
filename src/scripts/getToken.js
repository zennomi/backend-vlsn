require("dotenv").config();
const jwt = require("jsonwebtoken");

const token = jwt.sign({ id: "aaa", email: "aa@gmail.com", displayName: "Nguyen Van A", photoURL: "ahaha" }, process.env.TOKEN_KEY, { expiresIn: "2h" });

console.log(token);