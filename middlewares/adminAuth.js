function adminAuth(req, res, next) {
  console.log("chegou");
  if (req.session.user != undefined) {
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = adminAuth;
