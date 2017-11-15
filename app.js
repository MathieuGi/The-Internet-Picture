var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var winston = require('winston');
var socket_io = require("socket.io");
var compression = require("compression");
var device = require("express-device");

var app = express();

app.use(compression());

// Call socket.io to app
var io = socket_io()
app.io = io;

var index = require('./routes/index')(io);
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// configure logger
winston.add(winston.transports.File, { filename: 'logger.log' });
winston.remove(winston.transports.Console);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images/static', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(helmet());
app.use(device.capture());

// At top of routing calls
app.all('*', ensureSecure);

device.enableViewRouting(app);

app.use('/', index);
app.use('/users', users);

// simplify import of jquery, bootstrap and popper in view
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist/'));

// Redirect the HTTP to the HTTPS
function ensureSecure(req, res, next) {
    winston.info("test")
    if (req.secure) {
        // OK, continue 
        return next();
    };
    // handle port numbers if you need non defaults
    res.redirect('https://' + req.hostname + req.url);
}

// Redirect all request to /
app.use(function (req, res) {
    res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;