const express = require("express");
const { default: slugify } = require("slugify");
const Category = require("../categories/Category");
const Article = require("./Article");
const router = express.Router();

router.get("/article", (req, res) => {
  res.send("Article Route");
});

router.get("/admin/articles", (req, res) => {
  Article.findAll({
    include: [{ model: Category }],
  }).then((articles) => {
    res.render("admin/articles/index", {
      articles: articles,
    });
  });
});

router.get("/admin/articles/new", (req, res) => {
  Category.findAll().then((categories) => {
    res.render("admin/articles/new", {
      categories: categories,
    });
  });
});

router.post("/articles/save", (req, res) => {
  var title = req.body.title;
  var content = req.body.content;
  var categoryId = req.body.categoryId;
  Article.create({
    title: title,
    body: content,
    categoryId: categoryId,
    slug: slugify(title),
  })
    .then(() => {
      res.redirect("/admin/articles");
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/admin/articles/edit/:id", (req, res) => {
  var id = req.params.id;
  if (isNaN(id)) {
    res.redirect("/admin/articles");
  }
  if (id != undefined) {
    Article.findByPk(id)
      .then((article) => {
        Category.findAll()
          .then((categories) => {
            res.render("admin/articles/edit", {
              article: article,
              categories: categories,
            });
          })
          .catch((error) => {
            console.log(error);
            res.redirect("/admin/articles");
          });
      })
      .catch((error) => {
        console.log(errror);
        res.redirect("/admin/articles");
      });
  }
});

router.post("/articles/delete", (req, res) => {
  var id = req.body.id;
  if (id != undefined && !isNaN(id)) {
    Article.destroy({
      where: { id: id },
    })
      .then(() => {
        res.redirect("/admin/articles");
      })
      .catch((errror) => {
        console.log(error);
      });
  }
});

module.exports = router;
