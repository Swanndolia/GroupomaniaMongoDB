const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");

exports.signup = (req, res, next) => {
  mailBody = req.body.mail.split("@");
  bcrypt
    .hash(req.body.pass, 10)
    .then((hash) => {
      const user = new User({
        mail: secureCrypt(mailBody[0]) + "@" + mailBody[1],
        pass: hash,
        username: secureCrypt(req.body.username),
      });
      user
        .save()
        .then(() =>
          res.status(201).json({
            userId: user.id,
            token: jwt.sign({ userId: user.id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
          })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  //si l'utilisateur a utilisé son email
  if (req.body.username.includes("@")) {
    userBody = req.body.username.split("@");
    User.findOne({ mail: secureCrypt(userBody[0]) + "@" + userBody[1] })
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "Utilisateur non trouvé !" });
        }
        bcrypt
          .compare(req.body.pass, user.pass)
          .then((valid) => {
            if (!valid) {
              return res.status(401).json({ error: "Mot de passe incorrect !" });
            }
            res.status(200).json({
              userId: user.id,
              token: jwt.sign({ userId: user.id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
            });
          })
          .catch((error) => res.status(500).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } //si l'utilisateur a utilisé son username
  else {
    User.findOne({ username: secureCrypt(req.body.username) })
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "Utilisateur non trouvé !" });
        }
        bcrypt
          .compare(req.body.pass, user.pass)
          .then((valid) => {
            if (!valid) {
              return res.status(401).json({ error: "Mot de passe incorrect !" });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
            });
          })
          .catch((error) => res.status(500).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  }
};

exports.getOneUser = (req, res, next) => {
  User.findOne({
    id: req.params.id,
  })
    .then((user) => {
      user.username = secureCrypt(user.username);
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyUser = (req, res, next) => {
  req.body.username = secureCrypt(req.body.username);
  const userObject = req.file
    ? {
        username: req.body.username,
        about: req.body.about,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };
  User.updateOne({ _id: req.params.id }, { ...userObject, _id: req.params.id })
    .then()
    .catch((error) => res.status(400).json({ error }));
  Post.find({ userId: req.params.id })
    .then((posts) => {
      if (posts[0]) {
        if (!req.body.imageUrl) {
          req.body.imageUrl = posts[0].userImageUrl;
        } else {
          req.body.imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
        }
        Post.updateMany({ userId: req.params.id }, { $set: { username: secureCrypt(req.body.username), userImageUrl: req.body.imageUrl } })
          .then()
          .catch((error) => res.status(400).json({ error }));
      }
      res.status(200).json({ message: "User et infos des posts modifiées !" });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getAllUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
