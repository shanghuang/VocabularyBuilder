var express = require('express');
var mongoose = require('mongoose');
var config = require('../config.json');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var util = require('./util.js');

var ObjectId = mongoose.Schema.Types.ObjectId;
var redis = require('redis');


var PostSchema = new mongoose.Schema({
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
    metadata : {
        fee : Number,
    },
    status : String,

}, {collection:'post'} );
var Post = mongoose.model('post', PostSchema);


var CommentSchema = new mongoose.Schema({

    page : Number,
    post_id : ObjectId,
    comments : [ 
        ObjectId
    ],
    comments : [
        {
            text : String,
            created : Date,
            user_id : ObjectId,
            like_count : Number,
            likes: [ObjectId],
            deleted: Boolean,
        }
    ],
    user_id : ObjectId,
    created : Date,
    deleted : Boolean,

}, {collection:'comment'} );
var Comment = mongoose.model('comment', CommentSchema);

function get(req,resp){
    var postid = req.query.postid;

    /*Post.find( {_id:ObjectId.fromString(postid) } , function(err, result){
        if(err){
            console.log("exec query "+ postid + " failed!");
        }
        else{
            resp.json(result).end();
        }
    });*/

    //Post.findById( postid, function(err, result){
    Post.findOne( { _id : postid}, function(err, result){
        if(err){
            console.log("exec query "+ postid + " failed!");
        }
        else{
            resp.json(result).end();
        }
    });
};

//app.delete('/post/:postid', function(req,resp){
function delete_post(req,resp){
    Post.update( { _id : req.params.postid}, { $set: { deleted: true }}, {}, function(err, result){
        if(err){
            console.log("exec query "+ req.params.postid + " failed!");
        }
        else{
            var key = "post:"+req.params.postid;
            redisclient.del(key, function(err, reply) {
                if(err){
                    console.log("redis del key error:" + key);
                }
                else{
                }
            });
            resp.json(result).end();
        }
    });
};


//app.delete('/comment/:commentid', function(req,resp){
function delete_comment(req,resp){
    Comment.findOne({post_id:req.query.postid }, function(err, result){
        if(err){

        }
        else{
            result.comments.forEach(function(comment, index,array){
                if( array[index]._id == req.params.commentid ){
                    array[index].deleted = true;
                }
            });
            result.save(
                function(e){ 
                  if(e){
                    console.log('error')
                  }
                  else{
                    console.log('no error')
                  }
                }
            );
        }
    });

    Post.update(    {_id: req.query.postid}, 
                    {   $pull:{comments : {_id:req.params.commentid}}, 
                        $inc : {comment_count : -1}                      }, 
                    {}, function(err, result){
        if(err){
            console.log("exec query "+ req.params.postid + " failed!");
        }
        else{
            resp.json(result).end();
        }
    });

    var key = "post:"+req.query.postid;
    redisclient.del(key, function(err, reply) {
        if(err){
            console.log("redis del key error:" + key);
        }
        else{
        }
    });

    /*Comment.update( {post_id:req.query.postid}, {$set:{comments : {_id:req.params.commentid}}}, {}, function(err, result){
        if(err){
            console.log("exec query "+ req.params.postid + " failed!");
        }
        else{
            resp.json(result).end();
        }
    });*/
};

module.exports = {
    get : get,
    delete_post : delete_post,
    delete_comment : delete_comment,
    postModel : Post,
}
