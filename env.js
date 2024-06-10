const fs = require("fs");
const dotenv = require("dotenv");

// We check for the existence of a local .env file
if (fs.existsSync("./.env.local")) {
  dotenv.config({ path: "./.env.local" });
} else {
  dotenv.config();
}

// Here we are debugging the connection to the database
const CONNECTION_URI = process.env.CONNECTION_URI;

if (!CONNECTION_URI) {
  throw new Error("No CONNECTION_URI provided in env.js");
}
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("No JWT_SECRET provided in env.js");
}

module.exports = {
  CONNECTION_URI,
  JWT_SECRET,
};
