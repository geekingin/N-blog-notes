var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session=require('express-session');
var MongoStore=require('connect-mongo')(session);

var routes = require('./routes/index');
var settings=require('./settings');

var multer=require('multer');

//flash 是一个在session中用于存储信息的特定区域，信息写入flash，*下一次*显示后即被清除。
//典型应用是结合重定向功能，确保信息是提供给下一个被渲染的页面。
var flash=require('connect-flash');

//var users = require('./routes/users');

//生成一个app实例
var app = express();

//app.set('port',process.env.PORT||3000);
// view engine setup
//设置存放目录视图文件(views)的目录为views。__dirname为node全局变量，表示*当前正在执行的脚本*所在*目录*的路径
app.set('views', path.join(__dirname, 'views'));

//设置模版引擎为ejs
app.set('view engine', 'ejs');

//设置/public/favicon.ico为favicon图标
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(flash());
//加载日志中间件
app.use(logger('dev'));
//加载解析json中间件
app.use(bodyParser.json());
//加载解析urlencoded请求体的中间件
app.use(bodyParser.urlencoded({ extended: false }));
//加载解析cookie的中间件
app.use(cookieParser());
//设置public文件为静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    //用secret防篡改cookie
    secret:settings.cookieSecret,
    key:settings.db,// cookie name
    cookie:{maxAge:1000*60*60*24*30},//30 days
    store:new MongoStore({
        db:settings.db,
        host:settings.host,
        port:settings.port
    })
}));

//利用express的第三方中间件multer来实现文件上传功能
app.use(multer({
    dest:'./public/images',//上传文件所在目录
    rename: function (filedname, filename) {//修改上传后的文件名，这里设置为保持原来的命名
        return filename;
    }
}));
//路由控制
//app.use('/', routes);
//app.use('/users', users);
routes(app);
// catch 404 and forward to error handler
//捕捉404错误并且转发到错误处理器#？
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
//开发环境下的错误处理，将错误信息渲染error模版并且显示到浏览器中
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
//生产环境下的错误处理，将错误信息渲染error模版并且显示到浏览器中
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
console.log(process.env.PORT);
//导出app实例并且供其他模块调用。
module.exports = app;
