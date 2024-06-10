const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

const { JWT_SECRET } = require("./env");

passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log("incorrect username");
            return callback(null, false, {
              message: "Incorrect username or password.",
            });
          }
          if (!user.validatePassword(password)) {
            console.log("incorrect password");
            return callback(null, false, { message: "Incorrect password." });
          }
          console.log("finished");
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            console.log(error);
            return callback(error);
          }
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload, callback) => {
      console.log(jwtPayload);

      //    find all users and console log them
      //   DEBUG TOOL - I used this to see if the users from exported_collections/users.json had been added to the database
      //   await Users.find()
      //     .then((users) => {
      //       console.log(users);
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //     });
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          console.log(user);
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);

module.exports = passport;
