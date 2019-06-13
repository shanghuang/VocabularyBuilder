var express = require('express');
var mongoose = require('mongoose');
var config = require('../config.json');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var util = require('./util.js');
var post = require('./post.js');

var ObjectId = mongoose.Schema.Types.ObjectId;
var redis = require('redis');


/*var PostSchema = new mongoose.Schema({
    type : String,
    text : String,
    created : Date,
    user_id : ObjectId,
    comment_count : Number,
    like_count : Number,
    likes : [ 
        ObjectId
    ],
    commentators : [ 
        ObjectId
    ],
    comments : [
        {
            text : String,
            created : Date,
            user_id : ObjectId,
            like_count : Number,
        }
    ],
    deleted : Boolean,

}, {collection:'post'} );

var Post = mongoose.model('post', PostSchema);
*/
var Post = post.postModel;

function getCount(req,resp){
    var queryString={'type' : 'tutor'};
    /*if(req.query.dbquery){
        queryString = JSON.parse(req.query.dbquery);
    }*/
    Post.count(queryString, function(err, result){
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
    var queryString={'type' : 'tutor'};
    if(req.query.dbquery){
        queryString = JSON.parse(req.query.dbquery);
    }

    var date = new Date(req.query.createTimeLastItem);

    var query2exec = Post.find(queryString);
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

function updateStatus(req,resp){
    Post.findOne({_id:req.query.postid }, function(err, result){
        result.status = req.query.status;

        result.save(function(e){ 
            console.log( e ? 'error' : "");
            /*var key = "user:"+req.query.userid;
            redisclient.del(key, function(err, reply) {
                console.log(err ? "redis del key error:" + key : "");
            });*/
            resp.end();
        });
    });
};


module.exports = {
    getCount : getCount,
    get : get,
    updateStatus : updateStatus,
}
