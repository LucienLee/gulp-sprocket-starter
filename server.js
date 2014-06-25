var connect = require('connect'),
    serveStatic = require('serve-static');
//load configuration file
var config = require('./config.json');

var PORT = process.env.PORT || config.port;
var NODE_ENV = process.env.NODE_ENV || 'development';
/*
 * start a static file server
 */
var server = connect()
    .use(serveStatic(config.paths.app.root, {
        maxAge: Infinity
    }));
if ('production' !== NODE_ENV) {
    server.use(serveStatic(config.paths.dist.root));
}
server.listen(PORT, function() {
    console.log("Connect server in " + NODE_ENV + " started at PORT " + PORT);
});