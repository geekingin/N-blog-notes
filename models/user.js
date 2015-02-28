var mongodb=require('./db');

function User(user){
    this.name=user.name;
    this.password=user.password;
    this.email=user.email;
}

//存储用户信息的方法
User.prototype.save=function(callback){
    //要存入数据库的用户文档(数据)
    var user={
        name:this.name,
        password:this.password,
        email:this.email
    };
    //打开数据库
    mongodb.open(function(err,db){
       if (err){
           return callback(err);
       }
        //读取*user集合*，并将返回的集合信息传递给回调函数collection参数
       db.collection('user',function(err,collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           //在users集合中插入user数据
           //并在回调函数中关闭数据库
           collection.insert(user,{
               safe:true
           }, function (err, user) {
               mongodb.close();
               if (err){//如果出错，返回err信息
                   return callback(err);
               }
               callback(null,user[0]);//成功的话，err为null，返回存储后的用户文档
           });
       });
    });
};

//读取用户信息
User.get=function(name,callback){
    //打开数据库
  mongodb.open(function (err, db) {
      if (err){
          return callback(err);
      }
      //读取users集合
      db.collection('user', function (err, collection) {
          if (err){
              mongodb.close();
              return callback(err);
          }
//          查找用户名(name)值为name的一个文档
          collection.findOne({
              name:name
          }, function (err, user) {
              mongodb.close();
              if (err){
                  return callback(err);//失败，返回err信息
              }
              callback(null,user);//成功，返回查询信息
          });
      });
  });
};


module.exports=User;