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
			email:'',
			password: '',
			rememberMe: false,
			login_success: false,
			incorrectUser:false,
			incorrectPassword:false
		};
		console.log('constructor!');
		this.handleLogin = this.handleLogin.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.passwordChange = this.passwordChange.bind(this);
	}

	handleChange(event){
		this.setState({email: event.target.value});
	}

	passwordChange(event){
		this.setState({password: event.target.value});
	}

	async handleLogin(event){
		event.preventDefault();
		var data = {
			'email': this.state.email,
			'password': this.state.password,
		};
		this.setState( { incorrectUser : false,
						incorrectPassword : false});
		let result = await api.post('/access_token',data);
		if(result != null){
			if(result.body.access_token){
				var token = result.body.access_token;

				this.props.onLogin({
				'email': this.state.email,
				'access_token': token,
				});
				this.props.cookies.set('access_token', token);
				this.setState({login_success:true});
			}
			else if(result.body.error_code){
				if(result.body.error_code == 40102){
					this.setState( { incorrectPassword : true });
				} 
				else if(result.body.error_code == 40101){
					this.setState( { incorrectUser : true });
				} 
			}
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
      <input type="text" className="form-control" value={this.state.email} placeholder="Email" onChange={this.handleChange} required="" autoFocus="" />
      <input type="password" className="form-control" value={this.state.password} placeholder="Password" onChange={this.passwordChange} required=""/>
      <label className="checkbox">
        <input type="checkbox" value={this.state.rememberMe} id="rememberMe" name="rememberMe" /> Remember me
      </label>
      <button className="btn btn-lg btn-primary btn-block" type="submit" >Login</button>
    </form>
		{
			this.state.incorrectUser && <div className="login-alert">* The email you entered does not belong to any account.'</div>
		}
		{
			this.state.incorrectPassword && <div className="login-alert">* The password you entered is incorrect.'</div>
		}
				
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
