const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const conn = require("./database/database");
const session = require("express-session");

//controllers
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticleController");
const usersController = require("./users/UserController");

//models
const Article = require("./articles/Article");
const Category = require("./categories/Category");

//view-enginer
app.set("view engine", "ejs");

//sessions
app.use(
  session({
    secret: "TH2fZ7ecMm3xQa",
    cookie: {
      maxAge: 300000000,
    },
  })
);

//body-parser
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

//static
app.use(express.static("public"));

//database
conn
  .authenticate()
  .then(() => {
    console.log("Database Connected!");
  })
  .catch((error) => {
    console.log(error);
  });

//routes
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

app.get("/", (req, res) => {
  Article.findAll({
    order: [["id", "DESC"]],
    limit: 3,
  }).then((articles) => {
    Category.findAll({
      order: [["title", "ASC"]],
    }).then((categories) => {
      res.render("index", {
        articles: articles,
        categories: categories,
      });
    });
  });
});

app.get("/:slug", (req, res) => {
  var slug = req.params.slug;
  Article.findOne({
    where: {
      slug: slug,
    },
  })
    .then((article) => {
      if (article != undefined) {
        Category.findAll().then((categories) => {
          res.render("article", {
            article: article,
            categories: categories,
          });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
  var slug = req.params.slug;
  Category.findOne({
    where: {
      slug: slug,
    },
    include: [
      {
        model: Article,
      },
    ],
  })
    .then((category) => {
      if (category != undefined) {
        Category.findAll().then((categories) => {
          res.render("index", {
            articles: category.articles,
            categories: categories,
          });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/");
    });
});

app.listen("8080", () => {
  console.log("Server UP!");
});
