var express = require('express');
var mongoose = require('mongoose');
var lemmatizer = require('lemmatizer');

var WordSchema = new mongoose.Schema({
    word : String,
    translated : String
}, {collection:'dictionary'});

var Word = GLOBAL.dict_db_conn.model('dictionary', WordSchema);

var VocabSchema = new mongoose.Schema({
    email: String,
    word : String,
    lemmatized : String,
    date : Date,
    to_learn: Boolean,
    sentence : String
}, {collection:'vocab_record'});

var VocabRecord = GLOBAL.dict_db_conn.model('vocab_record', VocabSchema);

function get(req,resp){

    var lemmatized_word = lemmatizer.lemmatizer(req.query.word.toLowerCase());
    if(req.query.word){
        queryString = {'word' : lemmatized_word || req.query.word };
    }

    var query2exec = Word.find({'word' :  req.query.word });
    query2exec.exec(function(err, result){
        if(err){
            console.log("exec query "+ req.query.dbquery + "failed!");
        }
        else{
            if( result.length>0 ){
                resp.json({
                    'word': req.query.word,
                    'translated':result[0].translated,
                }).end();
            }
            else{
                Word.find({'word' :  lemmatized_word }).exec(function(err, result){
                    if(err){
                        console.log("exec query "+ req.query.dbquery + "failed!");
                        //todo:response error status
                    }
                    else{
                        var response =  (result.length>0)? result[0].translated : "";
                        //response = response.split("\n").join("<br/>");
                        resp.json({
                            'word': lemmatized_word,
                            'translated':response,
                        }).end();
                    }
                });
            }
        }
    });
};


function post(req,resp){

    var words2add = JSON.parse(req.body.words2add.toLowerCase());
    var paragraph = req.body.paragraph.toLowerCase();
    var re = /[ \n;:,."”“()]/; 
    var text_ary = paragraph.split(re);
    var lemmatized_ary = text_ary.map( x=> lemmatizer.lemmatizer(x.toLowerCase()));

    console.log("words2add:"+words2add);

    var new_count = 0;

    var jobs = lemmatized_ary.map( async element => {
        //return await VocabRecord.find({word : element.toLowerCase()});
        return await VocabRecord.find({lemmatized : element});
    });

    Promise.all(jobs).then((found_result) => {
        //var exists = found_result.map(x => x.length!=0);
        var words_not_in_voc = [];
        for(var i=0;i<found_result.length; i++){
            var not_in_voc = (found_result[i].length == 0);
            if(not_in_voc || words2add.includes(text_ary[i])){
                words_not_in_voc.push(
                            {   word:text_ary[i],
                                lemmatized:lemmatized_ary[i] });
            }
        }

        //console.log("words_not_in_voc:"+words_not_in_voc);
        var jobs2 = words_not_in_voc.map( async element => {
            return await VocabRecord.create({email: req.body.email,
                word : element.word,
                lemmatized : element.lemmatized,
                date : Date.now(),
                to_learn: words2add.includes(element.word),
                sentence : paragraph.split(".").find(s => s.includes(element.word))
            });
        });

        Promise.all(jobs2).then( () => {
            resp.json({
                word_added:words_not_in_voc.length
            }).end();
        });

    });
/*    text_ary.forEach(async element => {
        if(element.length != 0){

            var queryString={word : element};
            //var isnew = words2add.includes(element);
            console.log("type of words2add:" + typeof(word2add));
            var isnew =  words2add.some( function(item, index, array){ return (x===element);  } );
            if(isnew){
                var create_result = await VocabRecord.create({username: req.body.username,
                    word : element,
                    date : Date.now(),
                    to_learn: true,
                    sentence : paragraph});
                console.log("create new result:"+create_result);
                jobs.push(create_result);
                new_count++;
            }
            else{
                var word_found = await VocabRecord.find(queryString);
                if(word_found.length == 0){
                    var create_result = await VocabRecord.create({username: req.body.username,
                        word : element,
                        date : Date.now(),
                        to_learn: false,
                        sentence : paragraph});
                    //console.log("create result:"+create_result);
                    jobs.push(create_result);
                    new_count++;
                }
            }
        }
    });
    Promise.all(jobs).then( () => {
        resp.json({
            word_added:new_count
        }).end();
    });
*/
}

let VOCAB_STATUS={
    Familiar:0,
    JustLearned:1,
    NotInVocabulary:2
}

function getVocabulary(req,resp){

    //var words = req.query.words;
    var words = JSON.parse(req.query.words.toLowerCase());
    if(words.length == 0){
        resp.json({
            'voc_state':[],
        }).end();
        return;
    }

    var jobs = words.map( async element => {
        //return await VocabRecord.find({word : element.toLowerCase()});
        return await VocabRecord.find({lemmatized : lemmatizer.lemmatizer(element.toLowerCase())});
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
    var sort_order = req.query.sort_order == 0 ? {date:1} : {word:1};

    VocabRecord.find({email: req.query.email, to_learn:true})
        .sort(sort_order)
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