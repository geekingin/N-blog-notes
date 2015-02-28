var settings=require('../settings'),
	Db=require('mongodb').Db,
	Connection=require('mongodb').Connection,
	Server=require('mongodb').Server;
// 设置数据库名、数据库地址、数据库端口，建立了一个数据库连接实例，通过exports导出实例。
// 这样就可以通过require这个文件来对数据库进行读写
module.exports=new Db(settings.db,new Server(settings.host,settings.port),{safe:true});