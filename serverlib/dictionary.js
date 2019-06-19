var express = require('express');
var mongoose = require('mongoose');

var WordSchema = new mongoose.Schema({
    word : String,
    translated : String
}, {collection:'dictionary'});

var Word = GLOBAL.dict_db_conn.model('dictionary', WordSchema);

var VocabSchema = new mongoose.Schema({
    username: String,
    word : String,
    date : Date,
    to_learn: Boolean,
    sentence : String
}, {collection:'vocab_record'});

var VocabRecord = GLOBAL.dict_db_conn.model('vocab_record', VocabSchema);

function get(req,resp){
    //var queryString = req.query.dbquery || {};
    var queryString={'word' : 'tutor'};
    if(req.query.word){
        queryString = {'word' : req.query.word };
    }

    var query2exec = Word.find(queryString);
    query2exec.exec(function(err, result){
        if(err){
            console.log("exec query "+ req.query.dbquery + "failed!");
        }
        else{
            var response =  (result.length>0)? result[0].translated : "";
            //response = response.split("\n").join("<br/>");
            resp.json({
                'translated':response,
            }).end();

        }
    });

};

function post(req,resp){

    var words2add = req.body.words2add.toLowerCase();
    var paragraph = req.body.paragraph.toLowerCase();
    var re = /[ \n;:,.]/; 
    var text_ary = paragraph.split(re);

    var new_count = 0;
    text_ary.forEach(async element => {
        if(element.length != 0){

            var queryString={word : element};
            var word_found = await VocabRecord.find(queryString);
            var isnew = words2add.includes(element);
            if(isnew){
                var create_result = await VocabRecord.create({username: req.body.username,
                    word : element,
                    date : Date.now(),
                    to_learn: true,
                    sentence : paragraph});
                console.log("create new result:"+create_result);
                new_count++;
            }
            else{
                if(word_found.length == 0){
                    var create_result = await VocabRecord.create({username: req.body.username,
                        word : element,
                        date : Date.now(),
                        to_learn: false,
                        sentence : paragraph});
                    console.log("create result:"+create_result);
                    new_count++;
                }
            }
        }
    });

    resp.json({
        word_added:new_count
    }).end();
}

let VOCAB_STATUS={
    Familiar:0,
    JustLearned:1,
    NotInVocabulary:2
}

function getVocabulary(req,resp){

    var words = req.query.words;
    if(words.length == 0){
        resp.json({
            'voc_state':{},
        }).end();
        return;
    }

    var jobs = words.map( async element => {
        return await VocabRecord.find({word : element.toLowerCase()});
    });

    
    Promise.all(jobs).then((words_found) => {
        var result = [];
        for(var i=0;i<words_found.length; i++){
            w = words_found[i];
            if(w.length == 0){
                result.push( {word:words[i], status:VOCAB_STATUS.NotInVocabulary} );
            }
            else{
                var status = w[0].to_learn?VOCAB_STATUS.JustLearned : VOCAB_STATUS.Familiar;
                result.push( {word:w[0].word, status:status});
            }
        };
        resp.json({
            'voc_state':result,
        }).end();
    });
}

function get_history(req,resp){
    let SORT_ORDER = {
        SORT_BY_DATE : 0,
        SORT_BY_ALPHABET : 1
    }
    var page = req.query.page;
    var itemsPerPage = req.query.itemsPerPage || 50;
    var sort_order = req.query.sort_order;

    VocabRecord.find({username: req.query.username, to_learn:true})
        .sort({data:1})
        .limit(itemsPerPage)
        .skip(itemsPerPage*page)
        .exec(function(err, result){
            if(err){

            }
            else{
                resp.json( { words: result});
            }
    });

}

module.exports = {
    get : get,
    post:post,
    getVocabulary : getVocabulary,
    get_history:get_history
}