const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/users/new", (req, res) => {
  res.render("admin/users/new");
});

router.post("/users/save", adminAuth, (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  if (email == undefined || password == undefined) {
    res.redirect("/admin/users/new");
  }

  User.findOne({ where: { email: email } }).then((user) => {
    if (user == undefined) {
      User.create({
        email: email,
        password: hash,
      }).then(() => {
        res.redirect("/admin/users");
      });
    } else {
      res.redirect("/admin/users");
    }
  });
});

router.get("/admin/users", adminAuth, (req, res) => {
  User.findAll().then((users) => {
    res.render("admin/users/index", {
      users: users,
    });
  });
});

router.post("/users/delete", adminAuth, (req, res) => {
  var id = req.body.id;
  console.log(id);
  if (id != undefined && !isNaN(id)) {
    User.destroy({
      where: {
        id: id,
      },
    }).then(() => {
      res.redirect("/admin/users");
    });
  } else {
    res.redirect("/admin/users");
  }
});

router.get("/admin/users/edit/:id", adminAuth, (req, res) => {
  var id = req.params.id;
  if (isNaN(id)) {
    res.redirect("/admin/users");
  }
  User.findByPk(id)
    .then((user) => {
      if (user != undefined) {
        res.render("admin/users/edit", {
          user: user,
        });
      } else {
        res.redirect("/admin/users");
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/users/update", adminAuth, (req, res) => {
  var id = req.body.id;
  var email = req.body.email;
  var password = req.body.password;

  if (email == undefined) {
    res.redirect("/admin/users/edit/" + id);
  }

  User.findByPk(id)
    .then((user) => {
      console.log(user);
      if (password == undefined) {
        password = user.password;
      } else {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
      }

      User.findOne({ where: { email: email } }).then((userBd) => {
        if (
          userBd == undefined ||
          (userBd != undefined && userBd.id == user.id)
        ) {
          User.update(
            {
              email: email,
              password: hash,
            },
            {
              where: {
                id: id,
              },
            }
          );
        } else {
          res.redirect("/admin/users");
        }
      });
    })

    .then(() => {
      res.redirect("/admin/users");
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/login", (req, res) => {
  if (req.session.user != undefined) {
    res.redirect("/admin/articles");
  } else {
    res.render("admin/users/login");
  }
});

router.post("/authenticate", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({
    where: { email: email },
  }).then((user) => {
    if (user != undefined) {
      var validPassword = bcrypt.compareSync(password, user.password);
      if (validPassword) {
        req.session.user = {
          id: user.id,
          email: user.email,
        };
        res.redirect("/admin/articles");
      } else {
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = undefined;
  res.redirect("/");
});

module.exports = router;
