import React, { Component } from 'react'
import { BrowserRouter, Link } from 'react-router-dom'
import { withCookies, Cookies } from 'react-cookie'
import PropTypes, {instanceOf} from 'prop-types';
import ClickText from './Component/clicktext'
import api from './shared/apiHelper'

class History extends Component{
	static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props){
		super(props);
    	this.state = {
			page: 0,
            words:[],
            sortByValue : 0,
            translated:"",
		};
		console.log('constructor!');

        this.handleNextpage = this.handleNextpage.bind(this);
        this.handlePrevpage = this.handlePrevpage.bind(this);
        this.onSortByChanged = this.onSortByChanged.bind(this);
        this.getPage = this.getPage.bind(this);
        this.showTranslated = this.showTranslated.bind(this);
    }
    
    getPage(p, sortBy){
        api.get('/history', null, { username:this.props.username,
                                    page:p,
                                    sort_order:sortBy})
        .end( (err, result) => {
            if(err){

            }
            else{
                this.setState({words:result.body.words});
            }
        });
    }

    componentWillMount(){
        this.getPage(this.state.page, this.state.sortByValue);
    }

    handleNextpage(event){
        this.getPage(this.state.page+1, this.state.sortByValue);
        this.setState({page:this.state.page+1});
    }
    
    handlePrevpage(event){
        if(this.state.page>0){
            this.getPage(this.state.page-1, this.state.sortByValue);
            this.setState({page:this.state.page-1});
        }
    }
    
    onSortByChanged(event){
        this.setState({
                sortByValue: event.target.selectedIndex,
                page : 0});

        this.getPage(this.state.page, event.target.selectedIndex);
    }

    async showTranslated(event){
        var row = event.currentTarget.rowIndex-1;
        var word = "";
        if(this.state.words.length > row){
            word = this.state.words[row].word;
        }
        var data = {
			'word': word,
		};

		let result = await api.get('/dictionary',null, data);
		if(result != null){
            var tx_text = result.body.translated;
            tx_text = tx_text.split("\n").join(" <br> ");
            this.setState({translated:tx_text});
        }
    }

    render(){
        var words = this.state.words;
        var style_text_wrap = {'word-break': 'break-all',
                                'border-width':'1px',
                                'border-style':'solid',
                                'margin': '5px'};
        var isLogin = ( (this.props.username != null) && (this.props.username != "") );
        
        if( !isLogin ){
            return(<div className="row">Login required!</div>)
        }
        
        return(
<div className="row">
    <div className="col-md-8">
        <div className="row">
            <ul className="nav navbar-nav navbar-right">
                <select class="custom-select" onChange={this.onSortByChanged} value={this.state.sortByValue} id="inlineFormCustomSelectPref">
                    <option value="0">Sort by Date</option>
                    <option value="1">Sort by Alphabet Order</option>
                </select>

                <li className="active"><button className="btn btn-default" onClick={this.handlePrevpage}>Prev</button></li>
                <li className="active">{(50*this.state.page)} - {50*(this.state.page+1)}</li>
                <li className="active"><button className="btn btn-default" onClick={this.handleNextpage}>Next</button></li>

            </ul>
        </div>
        <div class="row table-responsive">          
        <table class="table">
            <thead>
            <tr>
                <th>#</th>
                <th>word</th>
                <th>date</th>
                <th>sentence</th>
            </tr>
            </thead>
            <tbody>
                {this.state.words.map(w =>
                    <tr onClick={this.showTranslated}>
                        <td>*</td>
                        <td>{w.word}</td>
                        <td>{w.date}</td>
                        <td>{w.sentence}</td>
                    </tr>
                )}
            </tbody>
        </table>
        </div>
    </div>
    <div className="col-md-4">
        <div style={style_text_wrap}>
            <p dangerouslySetInnerHTML={{__html: this.state.translated}} />
        </div>
    </div>
</div>
    )}
}


export default withCookies(History);