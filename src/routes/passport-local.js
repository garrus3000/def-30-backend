// import * as dotenv from 'dotenv'
import  dotenv from 'dotenv'
dotenv.config()

import passport from "passport";
import {Strategy as LocalStrategy} from 'passport-local';
import bcrypt from 'bcrypt';


import mongoose from 'mongoose';

mongoose.connect(
    process.env.MONGO_ATLAS_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const User = mongoose.model('usuarios', {
  username: String,
  password: String
});


passport.use('signup', new LocalStrategy((username, password, callback) => {
  const user = User.findOne({ username: username });
  user.then(usr => {
    if (usr) return callback(null, false);
    if (!usr) {
      const newUser = new User();
      newUser.username = username;
      newUser.password = bcrypt.hashSync(password, 10);
      newUser.save(() => callback(null, newUser));
    }
  });  
}));

passport.use('login', new LocalStrategy(  (username, password, callback) => {
  const user = User.findOne({ username: username });
  user.then(usr => {
    if (!usr || !bcrypt.compareSync(password, usr.password)) return callback(null, false);
    return callback(null, usr);
  });
}));


passport.serializeUser((user, callback) => {
    return callback(null, user.username);
});

passport.deserializeUser((id, callback) => {
    User.findById(id, (err, user) => {
        return callback(null, user);
    });
});
  

export default passport;