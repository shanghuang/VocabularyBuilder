import React, { Component } from 'react';
import api from './shared/apiHelper'
import { BrowserRouter, Route, Link , Redirect } from 'react-router-dom'
import PropTypes, {instanceOf} from 'prop-types';
//import cookie from 'cookie'
import { withCookies, Cookies } from 'react-cookie';

import { connect } from 'react-redux';
import {loginAction} from './actions';

class Login extends Component{
	static propTypes = {
    	cookies: instanceOf(Cookies).isRequired
	};

	constructor(props){
		super(props);
    	this.state = {
			username: '',
			password: '',
			rememberMe: false,
			login_success: false
		};
		console.log('constructor!');
		this.handleLogin = this.handleLogin.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.passwordChange = this.passwordChange.bind(this);
	}

	handleChange(event){
		this.setState({username: event.target.value});
	}

	passwordChange(event){
		this.setState({password: event.target.value});
	}

	async handleLogin(event){
		event.preventDefault();
		var data = {
			'name': this.state.username,
			'password': this.state.password,
		};

		let result = await api.post('/access_token',data);
		if(result != null){
			var token = result.body.access_token;

	        this.props.onLogin({
	          'username': this.state.username,
	          'access_token': token,
	        });
	        this.props.cookies.set('access_token', token);
	        this.setState({login_success:true});
		}
		else{
			//todo:error response
			//console.log('error:' + err);
			this.props.onLogin({
	          'username': null,
	          'email': null,
	          'access_token':null,
	        });
	        this.props.cookies.remove('access_token');
		}

		/*var that = this;
		api.post('/access_token',data).end( (err, result) => {
			if(!err){
				if(result.body.error_code != null){
					var a=0;
				}
				//var token = cookie.load('access_token');
				var token = result.body.access_token;

		        that.props.onLogin({
		          'username': that.state.username,
		          //'email': "",
		        });
		        that.props.cookies.set('access_token', token);
		        that.setState({login_success:true});
	    		//that.context.history.push(null, '/manage/user');
			}
			else {
				console.log('error:' + err);
				that.props.onLogin({
		          'username': null,
		          'email': null,
		          'access_token':null,
		        });
		        that.props.cookies.remove('access_token');
			}
		});*/
	}

//	onChange:function(event, userinfo){
		//this.setState( { username : userinfo ? userinfo.username : null } );
//	},

	render(){
		if(this.state.login_success){
			return (<Redirect to='/'/>);
		}

		return(
<div className="wrapper">
    <form className="form-signin" onSubmit={this.handleLogin}>
      <h2 className="form-signin-heading">Please login</h2>
      <input type="text" className="form-control" value={this.state.username} placeholder="User Name" onChange={this.handleChange} required="" autoFocus="" />
      <input type="password" className="form-control" value={this.state.password} placeholder="Password" onChange={this.passwordChange} required=""/>
      <label className="checkbox">
        <input type="checkbox" value={this.state.rememberMe} id="rememberMe" name="rememberMe" /> Remember me
      </label>
      <button className="btn btn-lg btn-primary btn-block" type="submit" >Login</button>
    </form>
    <Link to="/register" className="text-center new-account" >Create an account </Link>
</div>

	);}
}

Login.contextTypes = {
  history: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps){
	return {};
};

function mapDispatchToProps(dispatch, ownProps){
	return {
	    onLogin: function(params){
	      dispatch(loginAction(params))
	    }
	 };
}

var LoginCtrl = connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(Login));

export default LoginCtrl;
