import React, { Component } from 'react';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom'
import api from './shared/apiHelper'
//import cookie from 'cookie'
import { withCookies, Cookies } from 'react-cookie';
import PropTypes, {instanceOf} from 'prop-types';
import FormGroup  from './Component/formgroup'
import validate from 'validate.js'

class Register extends Component{
  static propTypes = {
      cookies: instanceOf(Cookies).isRequired
  };
  
  constructor(props){
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      password_confirm:false,
      error_message:'',
      validateError: false,
      registration_success:false,
    };
    //console.log('constructor!');
    this.register = this.register.bind(this);
  }

  register(event){
    event.preventDefault();
    var data = {
      'name': this.username.value.substring(0, 25),
      'email': this.email.value.trim(),
      'password': this.password.value,
    };

    var validateError = this.validate(data);
    this.setState({ validateError: validateError });
    if(validateError) {
      return false;
    }

    /*var inputs = {
      name: this.refs.nameInput.value.trim().substring(0, 25),
      email: this.refs.emailInput.value.trim(),
      password: this.refs.passwordInput.value,
    };*/

    if(this.password.value != this.password_confirm.value){
      this.state.error_message = 'password does not match!';
      return;
    };

    api.post('/user/add',data).end( (err, result) => {
      if(err){
      //todo:error message
        console.log('add user failed:', err);
      }
      else{
        this.setState({registration_success:true});
      }
    });
    /*let res = await api.post('/user/add',data);
    if(res == null){
      //todo:error message
    }
    else{
      this.setState({registration_success:true});
    }*/

  }

  validate(inputs) {

    var constraints = {
      name: {
        presence: {message: '* ' + 'Enter your full name'},
        length: {
          maximum: 30,
          tooLong: '* ' + 'Maximum length is 30 characters',
          },
      },
      email: {
        presence: {message: '* ' + 'Enter your email'},
        email: {message: '* ' + "Oops, that doesn't look like a valid email"},
      },
      password: {
        presence: {message: '* ' + 'Create a password'},
        length: {
          minimum: 8,
          tooShort: '* ' + 'Minimum length is 8 characters',
          },
      },
    };
    return validate(inputs, constraints, {fullMessages: false});
  }

  render(){
    if(this.state.registration_success){
      return (<Redirect to='/manage/user'/>);
    }

    var validateError = this.state.validateError;

    return(
<div>
  <form className="form-horizontal" action='' method="POST">
  <fieldset>
    <div id="legend">
      <legend className="">Register</legend>
    </div>
    <FormGroup validateError={validateError && validateError.name}>
      <div className="control-group">
        <label className="control-label" >Username</label>
        <div className="controls">
          <input type="text" id="username" ref={(input) => this.username = input} placeholder="" className="input-xlarge" />
          <p className="help-block">Username can contain any letters or numbers, without spaces</p>
        </div>
      </div>
    </FormGroup>
 
    <FormGroup validateError={validateError && validateError.email}>
      <div className="control-group">
        <label className="control-label" >E-mail</label>
        <div className="controls">
          <input type="text" id="email" ref={(input) => this.email = input} placeholder="" className="input-xlarge" />
          <p className="help-block">Please provide your E-mail</p>
        </div>
      </div>
    </FormGroup>
 
    <FormGroup validateError={validateError && validateError.password} >
      <div className="control-group">
        <label className="control-label" >Password</label>
        <div className="controls">
          <input type="password" id="password" ref={(input) => this.password = input} placeholder="" className="input-xlarge" />
          <p className="help-block">Password should be at least 4 characters</p>
        </div>
      </div>
    </FormGroup>
 
    <FormGroup validateError={validateError && validateError.password} >
      <div className="control-group">
        <label className="control-label" >Password (Confirm)</label>
        <div className="controls">
          <input type="password" id="password_confirm" ref={(input) => this.password_confirm = input} placeholder="" className="input-xlarge" />
          <p className="help-block">Please confirm password</p>
        </div>
      </div>
    </FormGroup>
 
    <div className="control-group">
      <div className="controls">
        <button className="btn btn-success" onClick={this.register} >Register</button>
      </div>
    </div>
    <div value={this.state.error_message}>
    </div>
  </fieldset>
  </form>
</div>
  );}
}

Register.contextTypes = {
  history: PropTypes.object.isRequired,
};

export default Register;
