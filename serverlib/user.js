var express = require('express');
var mongoose = require('mongoose');
var config = require('../config.json');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var util = require('./util.js');


var ObjectId = mongoose.Schema.Types.ObjectId;
//var redis = require('redis');


var UserSchema = new mongoose.Schema({

    name : String,
    birthday : String,
    gender : Number,
    nationality : String,
    privilege : Number,
    activity : Date,
    created : Date,
    email : String,
    password : String,
    tos : Number,
    native_language : [ 
        Number
    ],
    practice_language : [ 
        {
            id : Number,
            level : Number
        }
    ],
    email_verified : Boolean,
    tokens : [ 
        {
            token : String,
            created : Date
        }
    ],
    metadata : {
        suspend:Boolean,
    },
    country : String,
    city : String,
    verify_link : String,
    email_verified : Boolean,

}, {collection:'user'} );

var User = mongoose.model('user', UserSchema);


function getCount(req,resp){
    var queryString={};
    if(req.query.dbquery){
        queryString = JSON.parse(req.query.dbquery);
    }
    User.count(queryString, function(err, result){
        if(err){
            console.log("exec query "+ req.query.dbquery + "failed!");
        }
        else{
            resp.json({
                count:result,
            }).end();
        }
    });
};


function get(req,resp){
    //var queryString = req.query.dbquery || {};
    var queryString={};
    if(req.query.dbquery){
        queryString = JSON.parse(req.query.dbquery);
    }

    var date = new Date(req.query.createTimeLastItem);

    var query2exec = User.find(queryString);
    if(req.query.createTimeLastItem)
        query2exec.where('created').lt(new Date(req.query.createTimeLastItem));
    if(req.query.limit)
        query2exec.limit(parseInt(req.query.limit));

    query2exec.sort({'created': -1});
    query2exec.exec(function(err, result){
        if(err){
            console.log("exec query "+ req.query.dbquery + "failed!");
        }
        else{
            var num_item =  result.length;
            var last_item;
            if(result.length)
                last_item = result[ num_item - 1 ];
            resp.json({
                users:result,
                nextQuery: last_item? last_item.created : 0
            }).end();
        }
    });
};

function post_suspend(req,resp){

    User.findOne({_id:req.query.userid }, function(err, result){
        result.privilege = 10;
        result.metadata.suspend = true;
        result.save(function(e){ 
            console.log( e ? 'error' : "");
            var key = "user:"+req.query.userid;
            redisclient.del(key, function(err, reply) {
                console.log(err ? "redis del key error:" + key : "");
            });
            resp.end();
        });
    });
};

function post_unsuspend(req,resp){

    User.findOne({_id:req.query.userid }, function(err, result){
        result.privilege = 20;
        result.metadata.suspend = false;
        result.save(function(e){ 
            console.log( e ? 'error' : "");
            var key = "user:"+req.query.userid;
            redisclient.del(key, function(err, reply) {
                console.log(err ? "redis del key error:" + key : "");
            });
            resp.end();
        });
    });
};

function post_test_adduser(req,resp){
    var num_user = 0;
    var error=null;

    try{
        num_user = parseInt(req.body.numberUser);
    }
    catch(e){

    }
    finally{
        
        for(var i=0;i<num_user;i++){
            var create_date = new Date("October 13, 2014 11:13:00");
            //create_date.setMinutes(create_date.getMinutes() + 100000*Math.random() );
            create_date.setMinutes(create_date.getMinutes() + 100*i );

            var testuser = new User({
                name:req.body.namePrefix+i,
                birthday : '2000-01-01',
                gender : 1,
                nationality : 'tw',
                privilege : 20,
                activity : new Date("October 13, 2014 11:13:00"),

                created : create_date,
                email : req.body.namePrefix+i+'@test.com',
                password : util.encode_password('12345678'),

                tos : 1,
                native_language : [ 1],
                practice_language : [ 
                    {
                        id : 999,
                        level : 3
                    }
                ],
                email_verified : true,
                tokens : [ 
                    {
                        token : uuid.v4(),
                        created : new Date("October 13, 2014 11:13:00")
                    }
                ],
                metadata : {},
                country : 'tw',
                city : 'Taichung',
            });
            testuser.save(function (err, userObj) {
              if (err) {
                console.log(err);
              } else {
                console.log('saved successfully:', userObj);
              }
            });
        }
        //resp.write("Hello World");
        resp.end();
    }
};

async function post_login(req,resp){
    let email = req.body.name;
    let password = req.body.password;

    try{
        let result = await User.findOne({email:req.body.name });
        if(result) {
            var encoded_passwd = util.encode_password(password);
            if(result.password != encoded_passwd){
                //todo
            }
            else{
                var token = uuid.v4();
                global.redisclient.set("token:" + token, result.id);     //callback?
                resp.json({
                    access_token:token,
                }).end();
            }
        }
        else{
            //todo:
        }
    }
    catch ( err ){

    }

    /*User.findOne({email:req.body.name }).then(function(result){
        if( result==null ){

        }
        else{
            var encoded_passwd = util.encode_password(password);
            if(result.password != encoded_passwd){

            }
            else{
                var token = uuid.v4();
                global.redisclient.set("token:" + token, result.id);     //callback?
                resp.json({
                    access_token:token,
                }).end();
            }
        }
    });*/

    /*User.findOne({email:req.body.name }, function(err, result){
        if( err || (result==null) ){

        }
        else{
            var encoded_passwd = util.encode_password(password);
            if(result.password != encoded_passwd){

            }
            else{
                var token = uuid.v4();
                global.redisclient.set("token:" + token, result.id);     //callback?
                resp.json({
                    access_token:token,
                }).end();
            }
        }
    });*/
};

function get_access_token(req,resp){
    var email = req.body.name;
    var key = global.redisclient.get("token:" + req.query.access_token, function(err,redis_result){
        if(redis_result == null){
            resp.json({username:""}).end();
        }
        else{
            User.findById(redis_result , function(err, result){
                if(err){

                }
                else{
                    resp.json({
                        username:result.name,
                    }).end();
                }
            });
        }
    });
};

function del_access_token(req,resp){

    global.redisclient.del("token:" + req.query.access_token, function(err,redis_result){
                resp.json({
                    error:err,
                }).end();

    });

};

async function post_add(req,resp){

    var create_date = new Date();
    //create_date.setMinutes(create_date.getMinutes() + 100000*Math.random() );
    var verify_link = util.encode_confirm_link(req.body.email);
    var link_html = `<!DOCTYPE html>
    <html>
        <head>
          <title>Confirm your account</title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        </head>

        <body>
          <div>
               <p>Just click on the button below - simple as that.</p>
               <a href=http://localhost:9998/confirm/` + verify_link + `>Confirm now</a>
          </div>
        </body>
    </html>`;

    var newuser = new User({
        name:req.body.name,
        birthday : '2000-01-01',
        gender : 1,
        nationality : 'tw',
        privilege : 20,
        activity : new Date("October 13, 2014 11:13:00"),

        created : create_date,
        email : req.body.email,
        password : util.encode_password(req.body.password),

        tos : 1,
        native_language : [ 1],
        practice_language : [ 
            {
                id : 999,
                level : 3
            }
        ],
        email_verified : true,
        tokens : [ 
            {
                token : uuid.v4(),
                created : create_date
            }
        ],
        metadata : {},
        country : 'tw',
        city : 'Taichung',
        verify_link : verify_link,
        email_verified : false,
    });
    
    try {
        let res = newuser.save();
        console.log('Add user(:' + req.body.name + '), ' +  res);
    }
    catch(err){

    }

    var info = {
        to:req.body.email,
        link:link_html,
    };
    util.SendConfirmationEmail(info);

    resp.end();

}

async function check_confirm(req,resp){
    let result;
    try{
        result = await User.findOne({verify_link:req.params.link });
        if(result != null){
            result.email_verified = true;
            result.save(function(e){ 
                console.log( e ? 'error' : "");
                /*var key = "user:"+req.query.userid;
                redisclient.del(key, function(err, reply) {
                    console.log(err ? "redis del key error:" + key : "");
                });*/
                //resp.end();
                resp.redirect('http://localhost:3000');
            });
        }
    }
    catch(err){
        //todo:
    }
    /*User.findOne({verify_link:req.params.link }, function(err, result){
        if(result != null){
            result.email_verified = true;
            result.save(function(e){ 
                console.log( e ? 'error' : "");
                
                //resp.end();
                resp.redirect('http://localhost:3000');
            });
        }
    });*/

}

module.exports = {
    getCount : getCount,
    get : get,
    post_add : post_add,
    post_suspend : post_suspend,
    post_unsuspend : post_unsuspend,
    post_test_adduser : post_test_adduser,
    post_login : post_login,
    get_access_token : get_access_token,
    del_access_token : del_access_token,
    check_confirm : check_confirm
}

