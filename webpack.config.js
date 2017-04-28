const getConfig = require('hjs-webpack');

const config = getConfig({
  // entry point for the app
  in: 'src/index.js',

  // Name or full path of output directory
  // commonly named `www` or `public`. This
  // is where your fully static site should
  // end up for simple deployment.
  out: 'dist',

  //hostname: 'staging.acme-prelude.appspot.com',

  // This will destroy and re-create your
  // `out` folder before building so you always
  // get a fresh folder. Usually you want this
  // but since it's destructive we make it
  // false by default
  clearBeforeBuild: '!(images|static|Procfile|server.js|package.json|favicon.ico|node_modules)',
});

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'source-map';
  config.entry[0] = `${config.entry[0]}?reload=true`;
}
module.exports = config;
