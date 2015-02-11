var express = require('express');
var router = express.Router();
var crypto=require('crypto');
var User=require('../models/user.js');
var Post=require('../models/post.js');
/* GET home page. */
//生成一个路由实例用来捕获访问主页的GET请求，导出这个路由并在app.js中通过app.use('/', routes); 加载。这样，当访问主页时，就会调用res.render('index', { title: 'Express' });渲染views/index.ejs模版并显示到浏览器中。
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});
//module.exports = router;

function checkLogin(req,res,next){
    if (!req.session.user){
        req.flash('error','未登录！');
        res.redirect('/login');
    }
    next();
}
function checkNotLogin(req,res,next){
    if (req.session.user){
        req.flash('error','已登录！');
        res.redirect('back');//返回之前的页面；
    }
    next();
}

module.exports=function(app){
//    app.get()和app.post()的第一个参数都为请求的路径，第二个参数为处理请求的回调函数。
//    回调函数有两个参数req和res，分别代表请求信息和相应信息。
    app.get('/',function(req,res){
        Post.get(null,function(err,posts){
           if (err) {
               posts=[];
           }
            console.log(posts);
            res.render('index',{
                title:'主页',
                user:req.session.user,
                posts:posts,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });

        });
    });
    app.get('/reg',checkNotLogin);
    app.get('/reg',function(req,res){
        res.render('reg',{
            title:'注册',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/reg',checkNotLogin);
    app.post('/reg',function(req,res){
        var name=req.body.name,
            password=req.body.password,
            password_re=req.body['password-repeat'];

        if (password_re != password){
            req.flash('error','两次密码输入不一致');
            return res.redirect('/reg');
        }
        var md5=crypto.createHash('md5');

        password=md5.update(req.body.password).digest('hex');

        var newUser=new User({
            name:name,
            password:password,
            email:req.body.email
        });

        User.get(newUser.name, function (err, user) {
            if (err){
                req.flash('error',err);
                return res.redirect('/');
            }

            if (user){
//                console.log('用户已经存在');
                req.flash('error','用户已经存在');
                return res.redirect('/reg');
            }

            newUser.save(function (err, user) {
                if (err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
//                把用户信息存在session，以后可以通过req.seesion.user读取用户信息
                req.session.user=user;
                req.flash('success','注册成功');

                //一定要有return
                return res.redirect('/');
            });
        })
    });

    app.get('/login',checkNotLogin);
    app.get('/login',function(req,res){
        res.render('login',{
            title:'登录',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/login',checkNotLogin);
    app.post('/login',function(req,res){
//        生成密码的md5值
        var md5=crypto.createHash('md5'),
            password=md5.update(req.body.password).digest('hex');
//检查用户的存在与否
        User.get(req.body.name,function(err,user){
            if (!user){
                req.flash('error','用户不存在！');
                return res.redirect('/login');
            }
//            检查密码是否一致
            if (user.password!=password){
                req.flash('error','密码错误!');
                return res.redirect('/login');//密码错误则跳转到登陆页
            }
//            用户密码匹配后，将用户信息存入session
            req.session.user=user;
            req.flash('success','登录成功');
            return res.redirect('/');//登录成功后跳转到主页
        });
    });

    app.get('/post',checkLogin);
    app.get('/post',function(req,res){
        res.render('post',{
            title:'发表',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/post',checkLogin);
    app.post('/post',function(req,res){
        var currentUser=req.session.user,
            post=new Post(currentUser.name,req.body.title,req.body.post);
        post.save(function (err) {
            if (err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','发布成功');
            res.redirect('/');//发表成功跳转到主页
        })
    });
    app.get('/logout',checkLogin);
    app.get('/logout',function(req,res){
//        把req.session.user赋值null丢掉session中的用户信息
        req.session.user=null;
        req.flash('success','登出成功');
        return rs.redirect('/');//登出成功后跳转到主页
    });
};