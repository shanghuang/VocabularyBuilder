import React, { Component } from 'react'
import { BrowserRouter, Link } from 'react-router-dom'
import { withCookies, Cookies } from 'react-cookie'
import PropTypes, {instanceOf} from 'prop-types';
import ClickText from './Component/clicktext'
import api from './shared/apiHelper'

class Vocabulary extends Component{
	static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props){
		super(props);
    	this.state = {
			text: '',
            words:[],
            selected_words:new Set(),
            translated:'',
		};
		console.log('constructor!');

        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleWordClick = this.handleWordClick.bind(this);
        this.handleAddVocabulary = this.handleAddVocabulary.bind(this);

	}

	async handleTextChange(event){
        let VOCAB_STATUS={
            Familiar:0,
            JustLearned:1,
            NotInVocabulary:2
        }

        this.setState({text: event.target.value});
        
        var newtext = event.target.value;
        var re = /[ \n;:,.]/; 
        var text_ary = newtext.split(re);
        var trim_text = text_ary.map( x=>x.trim() ); 
        var word_info = trim_text.map( x=>{return {'word':x, 'selected':false,'voc_status':VOCAB_STATUS.Familiar}});
        this.setState( {words: word_info});

        var data = {words: trim_text};
        var result = await api.get('/vocabulary',null, data);
		if(result != null){
            var voc_state = result.body.voc_state;
            var words = this.state.words;
            for(var i=0;i<words.length; i++){
                if(voc_state[i].word === words[i].word){
                    words[i].voc_status = voc_state[i].status;
                }
            }
            this.setState( {words: words});
        }

    }
    
    async handleWordClick(event){
        var clicked_word = event.target.innerText;
        var cur_words = this.state.words;
        var action_select = false;
        cur_words.forEach(element => {
            if(element.word === clicked_word){
                element.selected = !element.selected;
                action_select = element.selected;
            }
        });
        action_select ? this.state.selected_words.add(clicked_word)
                                                    :this.state.selected_words.delete(clicked_word);
        var updated_sel_words = this.state.selected_words;
        this.setState({words: cur_words,
                        selected_words : updated_sel_words});

        var data = {
			'word': clicked_word,
		};

		let result = await api.get('/dictionary',null, data);
		if(result != null){
            var tx_text = result.body.translated;
            tx_text = tx_text.split("\n").join(" <br> ");
            this.setState({translated:tx_text});
        }
    }
    
    async handleAddVocabulary(event){

        var words2add = JSON.stringify(Array.from(this.state.selected_words));
        var data = {username: this.props.username,
                    words2add : words2add,
                    paragraph: this.state.text};

        let result = await api.post('/dictionary', data);
		if(result != null){

        }

        this.setState({selected_words:new Set()});
    }

    componentWillMount(){
        var access_token = this.props.cookies.get('access_token');
        if( !access_token){
            //this.props.history.push('/login');
        }
        else{
            
        }
    }

    render(){
        var words = this.state.words;
        var style_text_wrap = {'word-break': 'break-all',
                                'border-width':'1px',
                                'border-style':'solid',
                                'margin': '5px'};
		return(
<div className="row">
    <div class="col-md-6">
        <form>
            <div class="form-group">
                <textarea class = "form-control" rows = "3" value={this.state.text} onChange={this.handleTextChange} placeholder = "Player Details"></textarea>
            </div>
        </form>
        <div style={style_text_wrap}>
            {words.map( wi => <ClickText word_info={wi}  clickHandler={this.handleWordClick}/> )}
        </div>
    </div>
    <div class="col-md-6">
        <div style={style_text_wrap}>
        {Array.from(this.state.selected_words).map( w =>{ return (<div> {w} <br/></div>); } ) }
        </div>
        <button type="button" onClick={this.handleAddVocabulary}>Click Me!</button>
        <div style={style_text_wrap}>
            <p dangerouslySetInnerHTML={{__html: this.state.translated}} />
        </div>
    </div>
</div>
    )}
}


export default withCookies(Vocabulary);