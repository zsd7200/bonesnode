// import libraries
const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const compression = require('compression');
const expressHandlebars = require('express-handlebars');

// set port and require router
const port = process.env.PORT || process.env.NODE_PORT || 3000;
const router = require('./router.js');

// setup express page
const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.webp`));
app.disable('x-powered-by');
app.use(compression());
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on port ${port}`);
});
