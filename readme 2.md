---
title: Walkthrough - A RESTful Express app with views
type: lab
duration: "1:25"
creator:
    name: Rane Gowan, Alex Chin
    city: London
competencies: Programming, Server Applications
---

# Walkthrough - A RESTful Express app with views

During this lesson, we're going to make an Express app to store our favourite movies!

Let's start by making sure we are running everything that we need and that our environment is as nice as it can be.

#### Is Mongo running?

Make sure mongo is running in the terminal using the command `mongod`. We can also test by running `mongo`.

#### Are any other servers running?

Express won't work if there are any other servers listening to the same port. To prevent this from happening, close all other terminal windows.

#### How many Chrome tabs have you got open?

Shut all tabs in Google Chrome that you aren't using. This should help you to have a tidy environment.


## Initial Express setup

First, let's create a project directory to hold our Express app:

```bash
$ mkdir movies-app
$ cd movies-app
```

#### Create a `package.json` file

It's always good practise to create a new `package.json` file for a new Node project. We can do this using the built in `npm init` command (`https://docs.npmjs.com/cli/init`):

```bash
$ npm init
```

As we're not making a production application, you can accept all of the defaults. Or, if you want - fill in with appropriate values. Once this has been finished, a `package.json` will be created inside our directory.

#### Create a `main` file

Our `package.json` by default specifies a `main` file as the entry point of the app.

> **Note:** The entry point is the file that is to be loaded and its `exports` object to be returned as the return value of the originating require call. First, Node looks for a `package.json` file and checks if it contains a `main` property. It will be used to point a file inside the package directory that will be the entry point. If main property does not exist, then Node tries in order `index.js`, `index.json` and `index.node`.

We want to create this main file in which we will setup and serve our Express app.

```bash
$ touch index.js
```

#### Install packages

Next, we need to install some of the packages that we will be using:

```bash
$ npm install express --save
$ npm install morgan --save
$ npm install ejs --save
$ npm install express-ejs-layouts --save
$ npm install body-parser --save
$ npm install mongoose --save
$ npm install method-override --save
```

These packages will be downloaded into a directory called `node_modules`.

> **Note:** You must be in the same directory as the `package.json` file that you created.

#### Require packages

Once these packages have been installed, we now need to require them inside our `index.js` file. By convention, we do this at the top of the file:

```js
const express 		 = require('express');
const morgan         = require('morgan');
const bodyParser 	 = require('body-parser');
const ejsLayouts 	 = require('express-ejs-layouts');
const methodOverride = require('method-override');
const mongoose 		 = require('mongoose');
```

#### App variables

Next, we need to add any other **constant** variables that we will use. Later, we might setup the environment-specific `config` variables like the `port` and the `databaseUrl` in a separate file:

```js
const app          = express();
const port         = process.env.PORT || 3000;

const databaseName = 'movies-app';
const databaseUrl  = `mongodb://localhost/${databaseName}`

mongoose.connect(databaseUrl, () => {
  return console.log(`Connected to db: ${databaseUrl}`);
});
```

Great! Now before we move on, let's test everything is working by serving our express app on the `port` we specified.

```js
app.listen(port, () => console.log(`Started on port: ${port}`));
```

Then run the app with `nodemon` in your terminal and you should see:

```bash
Started on port: 3000
```

#### App settings

Now, providing we don't have any errors in the terminal, we can move on to setting up the Express app's settings.

As we are making an app with view files, we need to setup a templating engine and a directory to hold our views.

```js
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
```

These settings are optional configuration variables that ExpressJS details in the [app settings table](http://expressjs.com/en/api.html#app.set).

#### App middleware

Next, we want to setup the rest of the app's middleware inside the `index.js` file. This should come after the app settings by convention.

```js
app.use(morgan('dev'));
app.use(ejsLayouts);
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
```

Let's go through these one-by-one:

```js
app.use(morgan('dev'));
```

- This enables morgan with a logging level of `dev`.

```js
app.use(ejsLayouts);
```

- Hijack the `res.render` method to load a `layout.ejs` file and add other files into this file as partials via the `<%- body %>` tag.

```js
app.use(express.static(`${__dirname}/public`));
```

- Setup the `public` directory to serve static files.

```js
app.use(bodyParser.urlencoded({ extended: true }));
```

- Allow Express to read the body of the HTTP request and add it into `res.body`. The option `extended: true` will convert the body into an object (`https://www.npmjs.com/package/body-parser#bodyparserurlencodedoptions`).

```js
app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
```

- Lets you use HTTP verbs such as `PUT` or `DELETE` in places where the client (BROWSER) doesn't support it. `PUT` and `DELETE` are no longer supported methods for the <form> tag. See [HTML5 differences from HTML4 (19 Oct 2010)](https://www.w3.org/TR/2010/WD-html5-diff-20101019/#changes-2010-06-24)

> **Note:** We need to ensure that we are setting up the `methodOverride` package AFTER the `bodyParser` one or else it won't work.

#### Recap

Nice! Now our `index.js` file should look something like this.

```js
const express        = require('express');
const morgan         = require('morgan');
const bodyParser     = require('body-parser');
const ejsLayouts     = require('express-ejs-layouts');
const methodOverride = require('method-override');
const mongoose       = require('mongoose');

const app            = express();
const port           = process.env.PORT || 3000;

const databaseName   = 'movies';
const databaseUrl    = `mongodb://localhost/${databaseName}`;

mongoose.connect(databaseUrl, () => {
  return console.log(`Connected to db: ${databaseUrl}`);
});

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.use(morgan('dev'));
app.use(ejsLayouts);
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.listen(port, () => console.log(`Started on port: ${port}`));
```

Before we continue, let's keep that development loop small and run `nodemon` to see if there are any errors.

## Creating a router

In order to direct our HTTP request to serve the correct view in our app, it's always a good idea to separate the app's routing logic into it's own file.

Let's create this file now:

```bash
$ mkdir config
$ touch config/routes.js
```

Inside `routes.js` we want to require `Express` again to create an Express Router. The `express.Router` class creates modular, mountable route handlers. A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.

```js
const express = require('express');
const router  = express.Router();
```

> **Note:** We could do this in one line
>
> ```js
> const router = require('express').router();
> ```

#### Creating routes

Back in the `config/routes.js` file, let's set up our home route. This route is sometimes referred to as the **root route** as it will be the view that is rendered when you visit `/`.

```js
router.route('/').get((req, res) => res.render('home'));
```

In this route, we are rendering a `home.ejs` file that will be injected into our `layout.ejs` file.

**We will make this file later.**

#### Export the router

As we want to make this `router` available in our main file (`index.js`), we need to export this variable at the bottom of the file:

```js
module.exports = router;
```

#### Require the router

Now, we need to `require` this `config/routes.js` file in our main file (`index.js`). We can add this to the rest of our app variables near the top.

```js
const router = require('./config/routes');
```

#### Export the router

Now that we have required the file, we need to mount some middleware to tell our Express app server to `use` it. We can mount this on a url, e.g. `/v1`, `/api`. However, we're just going to mount this router on `/` - which is the default.

> **Note:** The router definition needs to be underneath the other middleware as these routes should call `res.end` which will stop the chain of middleware:

```js
const router = require('./config/routes');
*
*
*
app.use('/', router);

app.listen(port, () => console.log(`Started on port: ${port}`));
```

#### Creating a view file

Next, we to make the view file for our root route. Before we do this, we need to make a `views` directory with a `home.ejs` file.

We have already setup our app to use `ejs` and to serve our view files from a `views` directory using `app.set`:

```js
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
```

We can also add our `layout.erb` file too!

```bash
$ mkdir views
$ touch views/home.ejs
$ touch views/layout.ejs
```

Inside our `layout.ejs` file let's add our html boilerplate.

We need to add `<%- body %>` into the main tag so that other templates can be injected here.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>MoviesApp</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <main>
      <%- body %>
    </main>
  </body>
</html>
```

Next, we can add some content into our `home.ejs` file

```html
<h1>Movies</h1>
```

If you navigate to `http://localhost:3000/` then should be able to see this title!

> **Note:** If this doesn't work, then check the names of all of file and the line:
>
> ```js
> app.use(express.static(`${__dirname}/public`));
> ```

#### Link with CSS

We can also check that our static files are working by creating a new `style.css` file and linking that in our new `layout.ejs` file.

> **Note:** Later, we might make a `src` directory and use `SCSS` in this project, however let's first check that the `public` directory is linked correctly.

```bash
$ mkdir public
$ mkidr public/css
$ touch public/css/style.css
```

Add some test CSS to check that it's being rendered by the browser.

```css
body {
  background: red;
}
```

Let's run `nodemon` and go to `http://localhost:3000/` in the browser and we should see that the body of the HTML has changed to be red!


## Setting up Bower

It is at this point that we're going to start thinking about what CSS framework we're going to use. We're not going to think about customising this styling yet. However, we might as well use snippets from our CSS framework as we build our pages as it will speed up our development.

We are going to use [Bower](https://bower.io/) to install all of our front-end packages.

> "Web sites are made of lots of things — frameworks, libraries, assets, and utilities. Bower manages all these things for you."

#### `bower init`

Let us run the command `bower init` in the terminal. This will create a `bower.json` file which will be very similar to the `package.json` created by `npm`.

```bash
$ bower init
```

#### Serving statics from `/bower_components`

There are a number of ways that we can link to the packages that we downloaded using Bower. One way is to enable our app to serve statics from the `/bower_components` directory in addition to our `/public` directory.

Inside `index.js`, we can add:

```js
app.use(express.static(`${__dirname}/bower-components`));
app.use(express.static(`${__dirname}/public`));
```

#### Installing Bootstrap

Now, let's install the CSS framework we're going to use, Bootstrap:

```bash
$ bower install bootstrap --save
```

Downloading Bootstrap will also install it's dependency jQuery. Now, let's make a link to these files in our `layout.ejs` file.

```html
<link rel="stylesheet" href="/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="/css/style.css">
<script src="/jquery/dist/jquery.min.js" charset="utf-8"></script>
<script src="/bootstrap/dist/js/bootstrap.min.js" charset="utf-8"></script>
```

Now, let's test that everything is working by ensuring that `nodemon` is working and refreshing the browser.

We should see that the font has changed for our `<h1>` and if we type `$` in the console, we should see the jQuery function defined.

## Adding more content

#### Making a navigation bar

Now, as we want our code to be as DRY as possible, let's create a partial for our navbar so that our `layout.erb`.

```bash
$ mkdir views/application
$ touch views/application/_header.ejs
```

> **Note:** We're using the directory name of `views/application` because this navigation is a __site-wide__ partial as opposed to a __page-specific__ one.

Inside this file we can add the Bootstrap navbar from the [Bootstrap website](http://getbootstrap.com/components/#navbar).

We can customise this however we want. For the minute, we're going to add three links:

1. `/` to home
2. `/movies` linking to Movies INDEX (we haven't created this yet!)
3. `/movies/new` linking to Movies NEW (we haven't created this yet!)

```html
<header>
  <nav class="navbar navbar-default">
    <div class="container">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="/">MovieApp</a>
      </div>

      <!-- Collect the nav links, forms, and other content for toggling -->
      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav navbar-right">
          <li><a href="/movies">All Movies</a></li>
          <li><a href="/movies/new">Add Movie</a></li>
        </ul>
      </div><!-- /.navbar-collapse -->
    </div><!-- /.container-fluid -->
  </nav>
</header>
```

Next, we can include our partial inside the `layout.erb` at the top of the `<body>` tag:

```html
<body>
  <%- include ./application/_header %>
  <%- body %>
</body>
```

#### Make a footer partial

Now we can go and repeat the process and add a partial for our website's footer:

```bash
$ touch views/application/_footer.ejs
```

Inside this file, we can add some content:

```html
<footer>
  <div class="container">
    Made with &hearts; in London
  </div>
</footer>
```

And then include it inside our `layout.ejs` file:

```html
<body>
  <%- include ./application/_header %>
  <%- body %>
  <%- include ./application/_footer %>
</body>
```

#### Adding a main tag

Let's also add a `<main>` tag around the `<%- body %>` as this is where the main content of the website will be injected.

```html
<body>
  <%- include ./application/_header %>
  <main>
    <%- body %>
  </main>
  <%- include ./application/_footer %>
</body>
```

Great! Now let's move onto creating the RESTful routes for our resource `movies`.


## RESTful Resource

Now that we have setup our app, we need to move on and create our RESTful resource of movies.

#### Making the model

Firstly, let's create the mongoose model for this resource.

```bash
$ mkdir models
$ touch models/movie.js
```

> **Note:** Models should have singular filenames.

Inside `movie.js` we need to create a Mongoose schema. Everything in Mongoose starts with a [Schema](http://mongoosejs.com/docs/guide.html). Each schema maps to a MongoDB collection and defines the shape of the documents within that collection.

```js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
	title:       { type: String, trim: true, required: true },
	description: { type: String, trim: true }
}, {
	timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
```

- **trim** will remove any whitespace around the data.
- **required** will make that particular field required when creating a movie.
- **timestamps** will add two new fie;d `updatedAt` and `createdAt`.

#### Making the controller

Next, we now want to create the controller file in which we will be using the Model and rendering the relevant views:

```bash
$ mkdir controllers
$ touch controllers/movies.js
```

First we need to require our `movie` model at the top of the controller.

```js
const Movie = require("../models/movie");
```

Then, inside `movies.js`, we need to create the RESTful functions for our `movie` resource:

- **Index**
- **New**
- **Create**
- **Show**
- **Edit**
- **Update**
- **Delete**

For the moment, let's just make empty functions so that we can test them one-by-one later:

```js
const Movie = require("../models/movie");

// INDEX
function moviesIndex(req, res) {
}

// NEW
function moviesNew(req, res) {
}

// CREATE
function moviesCreate(req, res) {
}

// SHOW
function moviesShow(req, res) {
}

// EDIT
function moviesEdit(req, res) {
}

// UPDATE
function moviesUpdate(req, res) {
}

// DELETE
function moviesDelete(req, res) {
}
```

#### Exporting the functions

At the end of this controller, we need to export these functions so that we may use them in our `config/routes.js` file:

```js
module.exports = {
  index: moviesIndex,
  new: moviesNew,
  create: moviesCreate,
  show: moviesShow,
  edit: moviesEdit,
  update: moviesUpdate,
  delete: moviesDelete
};
```

## Making each RESTful function

Now, for every function you write, create the associated view and test it. Start with the `new` & `create` functions so that you can test to see if you can add a move to the database.

## NEW

#### Controller function

The new action should look like this:

```js
function moviesNew(req, res) {
	return res.render("movies/new", { error: null });
}
```

> **NOTE:** We have added a variable of `error` so that we can display errors on this view if there was any problem when trying to create a new movie.

#### View

We need to make a corresponding view with a new form:

```bash
$ mkdir views/movies
$ touch views/movies/new.ejs
```

Inside this view let's add:

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>

<section class="container">
  <h1>Add Movie</h1>
  <form action="/movies" method="post">
    <div class="form-group">
      <label for="movie_title">Title</label>
      <input type="text" class="form-control" id="movie_title" name="movie[title]" placeholder="Title">
    </div>
    <div class="form-group">
      <label for="movie_description">Description</label>
      <textarea class="form-control" id="movie_description" name="movie[description]" placeholder="Description"></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</section>
```

- This form is `POST`ing to `/movies` url. (We have not made this yet).

#### Route

Now, we need to create a route in our Express router. But first, we now need to include the `movies.js` controller in our `routes.js` file.

Inside `routes.js`, add:

```js
const express = require('express');
const router  = express.Router();

const movies  = require('../controllers/movies');

router.route('/movies/new')
	.get(movies.new);

module.exports = router;
```

#### Test & debug

Now, test everything to check that everything is linked up.

## CREATE

#### Controller function

The controller function for our CREATE action should look like this:

```js
function moviesCreate(req, res) {
	const movie = new Movie(req.body.movie);
	movie.save((err, movie) => {
		if (err) return res.render('moves/index', { movies: null, error: err.message });
		return res.redirect("/movies");
	});
}
```

> **Note:** We're expecting that the form uses the `movie[title]` syntax by looking for a `req.body.movie` property. This might not aways be the case.

#### View

There is no view for this action, only a redirect to the INDEX action.

#### Route

```js
const express = require('express');
const router  = express.Router();

const movies  = require('../controllers/movies');

router.route('/movies')
	.post(movies.create);
router.route('/movies/new')
	.get(movies.new);

module.exports = router;
```

#### Test & debug

Now, test everything to check that everything is linked up.

## INDEX

#### Controller function

Now, let's make a controller action that renders all of the `movies` from the database.

```js
function moviesIndex(req, res) {
	Movie.find({}, (err, movies) => {
		if (err) return res.render('movies/index', { movies: null, error: 'Something went wrong' });
		return res.render("movies/index", { movies });
	});
}
```

#### View

```bash
$ touch views/movies/index.ejs
```

The corresponding view file should loop over all the movies and display them on the page. Inside `views/movies/index.ejs`:

```html
<section class="container">
  <h1>All Movies</h1>
  <% movies.forEach((movie, i, original) => { %>
    <% if (i === 0) { %>
      <div class="row">
    <% } else if (i !== 0 && i % 3 === 0) { %>
      </div>
      <div class="row">
    <% }; %>
      <div class="col-md-4">
        <div class="thumbnail">
          <div class="caption">
            <h3><%= movie.title %></h3>
            <p><%= movie.description %></p>
            <p><a href="/movies/<%= movie._id %>" class="btn btn-primary" role="button">View</a></p>
          </div>
        </div>
      </div>
    <% if (i === original.length-1) { %>
      </div>
    <% }; %>
  <% }); %>
</section>
```

> **Notes:** Here we are using the Bootstrap thumbnail grid and trying to ensure that we are including the correct number of `<div class="row">` elements.

We have also created a dynamic link to the SHOW page using the movies `_id` property:

```html
<p><a href="/movies/<%= movie._id %>" class="btn btn-primary" role="button">View</a></p>
```

#### Route

```js
const express = require('express');
const router  = express.Router();

const movies  = require('../controllers/movies');

router.route('/movies')
	.get(movies.index)
	.post(movies.create);
router.route('/movies/new')
	.get(movies.new);

module.exports = router;
```

#### Test & debug

Now, test everything to check that everything is linked up.

## SHOW

#### Controller function

```js
function moviesShow(req, res) {
  Movie.findById(req.params.id, (err, movie) => {
    if (err) return res.render('movies/show', { movie: {}, error: 'Something went wrong.' });
    if (!movie) return res.render('movies/show', { movie: {}, error: 'No movie was found!' });
    return res.render('movies/show', { movie, error: null });
  });
}
```

#### View

```bash
$ touch views/movies/show.ejs
```

Inside this `show.ejs` we want to show the selected movie on the page. We're also going to create:

- A link to an EDIT action
- A form for deleting the movie

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>
<section class="container">
  <h1><%= movie.title %></h1>
  <p><%= movie.description %></p>
  <ul class="list-inline">
    <li><a class="btn btn-primary" href="/movies/<%= movie._id %>/edit">Edit</a></li>
    <li>
      <form action="/movies/<%= movie._id %>" method="post">
        <input type="hidden" name="_method" value="delete">
        <button class="btn btn-danger">Delete</button>
      </form>
    </li>
  </ul>
</section>
```

#### Route

```js
const express = require('express');
const router  = express.Router();

const movies  = require('../controllers/movies');

router.route('/movies')
	.get(movies.index)
	.post(movies.create);
router.route('/movies/new')
	.get(movies.new);
router.route('/movies/:id')
	.get(movies.show);

module.exports = router;
```

#### Test & debug

Now, test everything to check that everything is linked up.

## EDIT

#### Controller function

```js
function moviesEdit(req, res) {
  Movie.findById(req.params.id, (err, movie) => {
    if (err) return res.render('movies/edit', { movie: {}, error: 'Something went wrong.' });
    if (!movie) return res.render('movies/edit', { movie: {}, error: 'No movie was found!' });
    return res.render('movies/edit', { movie, error: null });
  });
}
```

#### View

```bash
$ touch views/movies/edit.ejs
```

Inside `edit.ejs` we want to render the edit form with the values of the movie selected.

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>

<section class="container">
  <h1>Edit Movie</h1>
  <form action="/movies/<%= movie._id %>" method="post">
    <input type="hidden" name="_method" value="put">

    <div class="form-group">
      <label for="movie_title">Title</label>
      <input type="text" class="form-control" id="movie_title" name="movie[title]" placeholder="Title" value="<%= movie.title %>">
    </div>
    <div class="form-group">
      <label for="movie_description">Description</label>
      <textarea class="form-control" id="movie_description" name="movie[description]" placeholder="Description"><%= movie.description %></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</section>
```

We're including the hidden field of with a name of `_method` and a value of `put`. We're doing this because HTML5 is unable to make PUT requests but we want our Express app to update our Movie using the `PUT` verb to follow the RESTful design pattern.

#### Route

```js
const express = require('express');
const router  = express.Router();

const movies  = require('../controllers/movies');

router.route('/movies')
	.get(movies.index)
	.post(movies.create);
router.route('/movies/new')
	.get(movies.new);
router.route('/movies/:id')
	.get(movies.show);
router.route('/movies/:id/edit')
  .get(movies.edit);

module.exports = router;
```

#### Test & debug

Now, test everything to check that everything is linked up.

## UPDATE

#### Controller function

For this controller function, we could use the built in Mongoose function of `findByIdAndUpdate`. However, `findByIdAndUpdate` ignores schema validations and hooks by default.

So, we're going to do a `.findById` followed by a separate a `.save`. We're then going to loop through all of the properties from the Movie Schema to update from the values in the edit form:

```js
function moviesUpdate(req, res) {
  Movie.findById(req.params.id, (err, movie) => {
    if (err) return res.render('movies/edit', { movie: {}, error: 'Something went wrong.' });
    if (!movie) return res.render('movies/edit', { movie: {}, error: 'No movie was found!' });

    for (const field in Movie.schema.paths) {
      if ((field !== '_id') && (field !== '__v')) {
        if (req.body.movie[field] !== undefined) {
          movie[field] = req.body.movie[field];
        }
      }
    }

    movie.save((err, movie) => {
      if (err) return res.render('movies/edit', { movie: {}, error: 'Something went wrong.' });
      return res.redirect(`/movies/${movie._id}`);
    });
  });
}
```

#### View

There is no view for this action, only a redirect to the SHOW action.

#### Route

```js
const express = require('express');
const router  = express.Router();

const movies  = require('../controllers/movies');

router.route('/movies')
	.get(movies.index)
	.post(movies.create);
router.route('/movies/new')
	.get(movies.new);
router.route('/movies/:id')
	.get(movies.show)
	.put(movies.update);
router.route('/movies/:id/edit')
  .get(movies.edit);

module.exports = router;
```

#### Test & debug

Now, test everything to check that everything is linked up.

## DELETE

#### Controller function

Finally, we need to make the controller action for deleting a movie.

```js
function moviesDelete(req, res) {
  Movie.findByIdAndRemove(req.params.id, err => {
    if (err) return res.render('movies/show', { movie: {}, error: 'Something went wrong.' });
    return res.redirect('/movies');
  });
}
```

#### View

There is no view for this action, only a redirect to the INDEX action.

#### Route

```js
const express = require('express');
const router  = express.Router();

const movies  = require('../controllers/movies');

router.route('/movies')
	.get(movies.index)
	.post(movies.create);
router.route('/movies/new')
	.get(movies.new);
router.route('/movies/:id')
	.get(movies.show)
	.put(movies.update)
   .delete(movies.delete);
router.route('/movies/:id/edit')
  .get(movies.edit);

module.exports = router;
```

#### Test & debug

Now, test everything to check that everything is linked up.

Now the Restful resource for `movie` is complete!


## Adding a second model of Director

In order to extend this application, we can follow this same pattern to add a second model. We might want to add a Director model. We'll then link the movies schema with the directors one with a referenced subdocument.

#### Create the Director model/schema

We're going to create a separate model for Directors. This is because we might want to list all of the Directors on our application and link multiple Movies to a single director.

```bash
$ touch models/director.js
```

Then we want to add some content to this model in a very similar way to the way we added content for our Movie model:

```js
const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema({
  name: { type: String, trim: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Director', directorSchema);
```

#### Referencing the Director Schema

Now, we can connect the director schema to the movie schema by making a reference to it's ObjectId:

```js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true },
  director: { type: mongoose.Schema.ObjectId, ref: 'Director' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
```

#### Making the routes

Now let's skip the step-by-step instructions and create routes for the director resource, remembering require the new `directors` controller:

```js
const movies    = require('../controllers/movies');
const directors = require('../controllers/directors');

.
.
.

router.route('/directors')
  .get(directors.index)
  .post(directors.create);
router.route('/directors/new')
  .get(directors.new);
router.route('/directors/:id')
  .get(directors.show)
  .put(directors.update)
  .delete(directors.delete);
router.route('/directors/:id/edit')
  .get(directors.edit);
```

#### Making the controller

Now we can make a controller for directors:

```bash
$ touch controllers/directors.js
```

Add the controller functions:

```js
const Director = require('../models/director');

function directorsNew(req, res) {
  return res.render('directors/new', { error: null });
}

function directorsCreate(req, res) {
  const director = new Director(req.body.director);
  director.save(err => {
    if (err) return res.render('directors/new', { error: err.message });
    return res.redirect('/directors');
  });
}

function directorsIndex(req, res) {
  Director.find({}, (err, directors) => {
    if (err) return res.render('directors/index', { directors: null, error: 'Something went wrong.' });
    return res.render('directors/index', { directors });
  });
}

function directorsShow(req, res) {
  Director.findById(req.params.id, (err, director) => {
    if (err) return res.render('directors/show', { director: {}, error: 'Something went wrong.' });
    if (!director) return res.render('directors/show', { director: {}, error: 'No director was found!' });
    return res.render('directors/show', { director, error: null });
  });
}

function directorsEdit(req, res) {
  Director.findById(req.params.id, (err, director) => {
    if (err) return res.render('directors/edit', { director: {}, error: 'Something went wrong.' });
    if (!director) return res.render('directors/edit', { director: {}, error: 'No director was found!' });
    return res.render('directors/edit', { director, error: null });
  });
}

function directorsUpdate(req, res) {
  Director.findById(req.params.id, (err, director) => {
    if (err) return res.render('directors/edit', { director: {}, error: 'Something went wrong.' });
    if (!director) return res.render('directors/edit', { director: {}, error: 'No director was found!' });

    for (const field in Director.schema.paths) {
      if ((field !== '_id') && (field !== '__v')) {
        if (req.body.director[field] !== undefined) {
          director[field] = req.body.director[field];
        }
      }
    }

    director.save((err, director) => {
      if (err) return res.render('directors/edit', { director: {}, error: 'Something went wrong.' });
      return res.redirect(`/directors/${director._id}`);
    });
  });
}

function directorsDelete(req, res) {
  Director.findByIdAndRemove(req.params.id, err => {
    if (err) return res.render('directors/show', { director: {}, error: 'Something went wrong.' });
    return res.redirect('/directors');
  });
}

module.exports = {
  index: directorsIndex,
  new: directorsNew,
  create: directorsCreate,
  show: directorsShow,
  edit: directorsEdit,
  update: directorsUpdate,
  delete: directorsDelete
};
```

#### Making the routes

Now we need to create the views:

```bash
$ mkdir views/directors
$ touch views/directors/new.ejs
$ touch views/directors/index.ejs
$ touch views/directors/edit.ejs
$ touch views/directors/show.ejs
```

**NEW**

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>

<section class="container">
  <h1>Add Director</h1>
  <form action="/directors" method="post">
    <div class="form-group">
      <label for="director_name">Name</label>
      <input type="text" class="form-control" id="director_name" name="director[name]" placeholder="Name">
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</section>
```

**INDEX**

```html
<section class="container">
  <h1>All Directors</h1>
  <% directors.forEach((director, i, original) => { %>
    <% if (i === 0) { %>
      <div class="row">
    <% } else if (i !== 0 && i % 3 === 0) { %>
      </div>
      <div class="row">
    <% }; %>
      <div class="col-md-4">
        <div class="thumbnail">
          <!-- <img src="..." alt="..."> -->
          <div class="caption">
            <h3><%= director.name %></h3>
            <p><a href="/directors/<%= director._id %>" class="btn btn-primary" role="button">View</a></p>
          </div>
        </div>
      </div>
    <% if (i === original.length-1) { %>
      </div>
    <% }; %>
  <% }); %>
</section>
```

**SHOW**

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>
<section class="container">
  <h1><%= director.name %></h1>
  <ul class="list-inline">
    <li><a class="btn btn-primary" href="/directors/<%= director._id %>/edit">Edit</a></li>
    <li>
      <form action="/directors/<%= director._id %>" method="post">
        <input type="hidden" name="_method" value="delete">
        <button class="btn btn-danger">Delete</button>
      </form>
    </li>
  </ul>
</section>
```

**EDIT**

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>

<section class="container">
  <h1>Add Director</h1>
  <form action="/directors/<%= director._id %>" method="post">
    <input type="hidden" name="_method" value="put">
    <div class="form-group">
      <label for="director_name">Name</label>
      <input type="text" class="form-control" id="director_name" name="director[name]" placeholder="Name" value="<%= director.name %>">
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</section>
```

## Creating a dropdown for Movies New

Let's update the new view for movies to contain a dropdown of directors.

#### Controller function

In order for us to be able to render a dropdown on our `movies/new` page, we need to make a query to the database.

```js
function moviesNew(req, res) {
  Director.find({}, (err, directors) => {
    if (err) return res.render('movies/new', { error: err.message });
    return res.render('movies/new', { error: null, directors });
  });
}
```

We're passing this directors variable through to the new page so that we can loop over it and build our `<select>`.

#### View

We're going to add a new field to the `movies/new.ejs` file:

```html
<div class="form-group">
  <label for="movie_director">Director</label>
  <select class="form-control" id="movie_director" name="movie[director]">
    <% directors.forEach(director => { %>
      <option value="<%= director._id %>"><%= director.name %></option>
    <% }) %>
  </select>
</div>
```

Making the view look like:

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>

<section class="container">
  <h1>Add Movie</h1>
  <form action="/movies" method="post">
    <div class="form-group">
      <label for="movie_title">Title</label>
      <input type="text" class="form-control" id="movie_title" name="movie[title]" placeholder="Title">
    </div>
    <div class="form-group">
      <label for="movie_description">Description</label>
      <textarea class="form-control" id="movie_description" name="movie[description]" placeholder="Description"></textarea>
    </div>
    <div class="form-group">
      <label for="movie_director">Director</label>
      <select class="form-control" id="movie_director" name="movie[director]">
        <% directors.forEach(director => { %>
          <option value="<%= director._id %>"><%= director.name %></option>
        <% }) %>
      </select>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</section>
```

## Creating a dropdown for Movies EDIT

#### Controller function

```js
function moviesEdit(req, res) {
  Movie.findById(req.params.id, (err, movie) => {
    if (err) return res.render('movies/edit', { movie: {}, error: 'Something went wrong.' });
    if (!movie) return res.render('movies/edit', { movie: {}, error: 'No movie was found!' });
    Director.find({}, (err, directors) => {
      if (err) return res.render('movies/new', { error: err.message });
      return res.render('movies/edit', { movie, directors, error: null });
    });
  });
}
```

#### View

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>

<section class="container">
  <h1>Add Movie</h1>
  <form action="/movies/<%= movie._id %>" method="post">
    <input type="hidden" name="_method" value="put">
    <div class="form-group">
      <label for="movie_title">Title</label>
      <input type="text" class="form-control" id="movie_title" name="movie[title]" placeholder="Title" value="<%= movie.title %>">
    </div>
    <div class="form-group">
      <label for="movie_description">Description</label>
      <textarea class="form-control" id="movie_description" name="movie[description]" placeholder="Description"><%= movie.description %></textarea>
    </div>
    <div class="form-group">
      <label for="movie_director">Director</label>
      <select class="form-control" id="movie_director" name="movie[director]">
        <% directors.forEach(director => { %>
          <option value="<%= director._id %>" <%= movie.director.toString() === director._id.toString() ? "selected" : "" %>><%= director.name %></option>
        <% }) %>
      </select>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</section>
```

## Populating the Director on Movies SHOW

If we output the director on the `movies/show` page - you will see that we just get the `._id` for the director.

#### View

```html
<p>By <%= movie.director %></p>
```

#### Controller function

In order to display the value of the model, we need to use Mongoose' in-built [`.populate` function](http://mongoosejs.com/docs/populate.html). This syntax tells Mongoose to go and make another query to the database to also fetch the values for an associated model.

```js
function moviesShow(req, res) {
  Movie
  .findById(req.params.id)
  .populate(['director'])
  .exec((err, movie) => {
    if (err) return res.render('movies/show', { movie: {}, error: 'Something went wrong.' });
    if (!movie) return res.render('movies/show', { movie: {}, error: 'No movie was found!' });
    return res.render('movies/show', { movie, error: null });
  });
}
```

#### View

We can now use the properties of a director in the view:

```html
<p>By <a href="/directors/<%= movie.director._id %>"><%= movie.director.name %></a></p>
```

> **Note:** We might think about making a director a required field?

#### Test & debug

Now, test everything to check that everything is linked up.


## Making an embedded subdocument

Referenced fields and referenced sub-documents are used when you expect that data is going to be repeated in your schema. However, when information in your schema won't be duplicated then you might need an embedded subdocument.

We can have a play with this by making a `comments` field for the Movie model.

> **Note:** Normally, we might consider making comments part of a User model. However, we haven't got a User model yet... so we'll just have to make use.

#### Model

To add an embedded subdocument, let's update the Movie Schema:

```js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true },
  director: { type: mongoose.Schema.ObjectId, ref: 'Director' },
  comments: [{
    body: { type: String, trim: true }
  }, {
    timestamps: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
```

- We can add `timestamps` to the embedded sub-document

#### Controller

We could add new functions in the `movies` controller. However, let's keep things separate and make a new `comments` controller:

```bash
$ touch controllers/comments.js
```

Now we can add the controller function for CREATE:

```js
const Movie = require('../models/movie');

function commentsCreate(req, res) {
  Movie.findById(req.params.id, (err, movie) => {
    if (err) return res.render('movies/show', { movie: {}, error: 'Something went wrong.' });
    if (!movie) return res.render('movies/show', { movie: {}, error: 'No movie was found!' });

    movie.comments.push(req.body.comment);

    movie.save((err, movie) => {
      if (err) return res.render('movies/show', { movie: {}, error: 'Something went wrong.' });
      return res.redirect(`/movies/${movie._id}`);
    });
  });
}

module.exports = {
  create: commentsCreate
};
```

We can see that adding an embedded sub-document can be achieved through the `.push` method.

#### Routes

We need a route to be able to reach this controller action:

```js
const router    = require('express').Router();

const movies    = require('../controllers/movies');
const directors = require('../controllers/directors');
const comments  = require('../controllers/comments');

router.route('/').get((req, res) => res.render('home'));

router.route('/movies')
  .get(movies.index)
  .post(movies.create);
router.route('/movies/new')
  .get(movies.new);
router.route('/movies/:id')
  .get(movies.show)
  .put(movies.update)
  .delete(movies.delete);
router.route('/movies/:id/edit')
  .get(movies.edit);

router.route('/movies/:id/comments')
  .post(comments.create);

router.route('/directors')
  .get(directors.index)
  .post(directors.create);
router.route('/directors/new')
  .get(directors.new);
router.route('/directors/:id')
  .get(directors.show)
  .put(directors.update)
  .delete(directors.delete);
router.route('/directors/:id/edit')
  .get(directors.edit);

module.exports = router;
```

#### View

Finally, let's add a form to create this comment in the `movies/show.ejs` page:

```html
<% if (error) { %>
  <div class="alert alert-danger text-center" role="alert"><%= error %></div>
<% } %>
<section class="container">
  <h1><%= movie.title %></h1>
  <p><%= movie.description %></p>
  <p>By <a href="/directors/<%= movie.director._id %>"><%= movie.director.name %></a></p>
  <ul class="list-inline">
    <li><a class="btn btn-primary" href="/movies/<%= movie._id %>/edit">Edit</a></li>
    <li>
      <form action="/movies/<%= movie._id %>" method="post">
        <input type="hidden" name="_method" value="delete">
        <button class="btn btn-danger">Delete</button>
      </form>
    </li>
  </ul>

  <h2>Add comment</h2>
  <form action="/movies/<%= movie._id %>/comments" method="post">
    <div class="form-group">
      <label for="comment_body">Comment</label>
      <input type="text" class="form-control" id="comment_body" name="comment[body]" placeholder="Add a comment yo...">
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>

  <h2>Previous comments</h2>
  <ul class="list-unstyled">
    <% movie.comments.forEach(comment => { %>
      <li><%= comment.body %></li>
    <% }) %>
  </ul>
</section>
```

Great! Obviously, this is just a simple example for this walkthrough. We will be expanding on this later.


## Gulp, SCSS and ES6

Now that we have 2 models working with all of their RESTful routes, let's update our app to use Gulp with a task for SCSS and ES6 transpilation.

#### Install packages

First, let's add all of the packages that we need for our gulp tasks:

```bash
$ npm install gulp --save-dev
$ npm install babel-cli --save-dev
$ npm install babel-preset-es2015 --save-dev
$ npm install gulp-babel --save-dev
$ npm install browser-sync --save-dev
$ npm install gulp-clean-css --save-dev
$ npm install gulp-sass --save-dev
$ npm install gulp-nodemon --save-dev
$ npm install gulp-uglify --save-dev
```

#### Create gulpfile

Now we need to make a `gulpfile.js` to setup our gulp tasks:

```bash
$ touch gulpfile.js
```

To this file, we want to add:

```js
const gulp        = require('gulp');
const babel       = require('gulp-babel');
const sass        = require('gulp-sass');
const nodemon     = require('gulp-nodemon');
const cleanCSS 	  = require('gulp-clean-css');
const uglify      = require('gulp-uglify');
const browserSync = require('browser-sync').create();

gulp.task('es6', () => {
  return gulp.src('src/js/*.js')
  .pipe(babel({ presets: ['es2015'] }))
  .pipe(uglify())
  .pipe(gulp.dest('public/js'));
});

gulp.task('sass', () => {
  return gulp.src('src/scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(cleanCSS({ compatibility: 'ie8'}))
  .pipe(gulp.dest('public/css'));
});

gulp.task('serve', ['es6', 'sass'], () => {
  browserSync.init({
    proxy: 'http://localhost:3000',
    files: ['public/**/*.*'],
    browser: 'google chrome',
    port: 7000,
    reloadDelay: 500
  });

  return nodemon({ script: 'index.js'})
    .on('start', () => browserSync.reload());
});

gulp.task('default', ['sass', 'es6', 'serve'], () => {
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/js/*.js', ['es6']);
  gulp.watch('views/**/*.ejs', browserSync.reload);
});
```

- First we require our packages
- Then we create tasks for
	- `ES6` transpilation
	- `SASS` conversion
	- `serve` with nodemon and BrowserSync
- Create a default task to run with the `gulp` command

#### Creating a `src` directory

Seeing as our task expect a `src` directory, we can create this with:

```bash
$ mkdir src
```

#### `scss` directory

Now we want to add a directory for our `scss` files and a main scss file:

```bash
$ mkdir src/scss
$ touch src/scss/style.scss
```

To test, let's add some `scss` to this new file:

```scss
body {
  background: blue;
}
```

#### Run with Gulp

We can test this setup now using `gulp`. Everything should work with live changes if you make a change to the src directory!


## Summary

That's all we have for now.

Perhaps have a look at:

- [Animate.css](https://daneden.github.io/animate.css/)
