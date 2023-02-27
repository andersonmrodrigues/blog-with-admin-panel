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

router.post("/articles/update", (req, res) => {
  var id = req.body.id;
  var title = req.body.title;
  var content = req.body.content;
  var categoryId = req.body.categoryId;
  Article.update(
    {
      title: title,
      body: content,
      categoryId: categoryId,
      slug: slugify(title),
    },
    {
      where: {
        id: id,
      },
    }
  )
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

router.get("/articles/page/:num", (req, res) => {
  var page = req.params.num;
  var offset = 0;

  if (isNaN(page) || page == 1) {
    offset = 0;
  } else {
    offset = (parseInt(page) - 1) * 3;
  }

  Article.findAndCountAll({
    limit: 3,
    offset: offset,
    order: [["id", "DESC"]],
  })
    .then((articles) => {
      var next = true;
      if (offset + 3 >= articles.count) {
        next = false;
      }
      var result = {
        page: parseInt(page),
        next: next,
        articles: articles,
      };

      Category.findAll().then((categories) => {
        res.render("admin/articles/page", {
          result: result,
          categories: categories,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
