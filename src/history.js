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
		};
		console.log('constructor!');

        this.handleNextpage = this.handleNextpage.bind(this);
        this.handlePrevpage = this.handlePrevpage.bind(this);
        this.getPage = this.getPage.bind(this);
    }
    
    getPage(p){
        api.get('/history', null, {username:this.props.username,page:p}).end( (err, result) => {
            if(err){

            }
            else{
                this.setState({words:result.body.words});
            }
        });
    }

    componentWillMount(){
        this.getPage(this.state.page);
    }

    handleNextpage(event){
        this.getPage(this.state.page+1);
        this.setState({page:this.state.page+1});
    }
    
    handlePrevpage(event){
        if(this.state.page>0){
            this.getPage(this.state.page+1);
            this.setState({page:this.state.page+1});
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
    <div >
        <ul className="nav navbar-nav navbar-right">
            <li className="active"><button className="btn btn-default" onClick={this.handlePrevpage}>Prev</button></li>
            <li className="active">{(50*this.state.page)} - {50*(this.state.page+1)}</li>
            <li className="active"><button className="btn btn-default" onClick={this.handleNextpage}>Next</button></li>

        </ul>
    </div>
    <div class="table-responsive">          
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
                <tr>
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
    )}
}


export default withCookies(History);