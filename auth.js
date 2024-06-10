const { JWT_SECRET } = require("./env");

const jwt = require("jsonwebtoken");

const passport = require("./passport"); // Your local passport file

let generateJWTToken = (user) => {
  try {
    return jwt.sign(user, JWT_SECRET, {
      subject: user.Username, //This is the username you're encoding in the JWT
      expiresIn: "7d", // This specifies that the token will expire in 7 days
      algorithm: "HS256", // This is the algorithm used to "sign" or encode the values of the JWT
    });
  } catch (error) {
    console.error(error);
  }
};

/* POST login. */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right",
          user: user,
          info,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send({error, info});
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token, info });
      });
    })(req, res);
  });

  // We only show this route in development mode to avoid security issues
  if (process.env.NODE_ENV === "development") {
    router.get("/login", (req, res) => {
      const user = {
        Username: "testuser",
      };
      let token = generateJWTToken(user);
      return res.json({ user, token, info });
    });
  }
};
