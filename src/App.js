import React, { Component } from 'react';
import { BrowserRouter, Route, Link, withRouter, Redirect } from 'react-router-dom'
import {connect} from 'react-redux'
import PropTypes, {instanceOf} from 'prop-types';
import Management from './management'
import Vocabulary from './vocabulary'
import History from './history'
import Login from './login'
import Register from './register'
import api from './shared/apiHelper'
//import cookie from 'cookie'
import { withCookies, Cookies } from 'react-cookie';

import {loginAction, logoutAction} from './actions'

import logo from './logo.svg';
import './App.css';


class Layout extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
        username:props.username,
        login_success:false,
    }
    this.logout = this.logout.bind(this);
  }

  /*componentWillReceiveProps(nextProps){
    if( (nextProps.username !== this.state.username)  ) 
    {
      this.setState({
        username:nextProps.username,
      });
    }
  }*/

  static getDerivedStateFromProps(nextProps, prevState) {
    // do things with nextProps.someProp and prevState.cachedSomeProp
    return {
        username:nextProps.username,
        access_token:nextProps.access_token,
    };
  }

  componentDidMount(){
    var token = this.props.cookies.get('access_token');
    if(token){
      api.get('/access_token').end( (err, result) => {
        if((!err) && (result.body.username!="") ){
          //Actions.setUserInfo(null);
          this.props.onReturn({
                'username': result.body.username,//this.refs.username.value,
                //'email': "",
                //'access_token':token,
              });
          //cookie.remove('admin_access_token');
          //this.context.history.pushState(null, '/manage/user');
          this.setState({login_success:true});
        }
        else {
          this.props.cookies.remove('access_token');
          this.setState({login_success:false});
        }

      });
    }
  }

  logout(event){
    event.preventDefault();
    /*var access_token = cookie.load('access_token');
    var data={
      access_token:access_token,
    };*/
    var that = this;
    api.del('/access_token').end( (err, result) => {
      if(!err){
        //Actions.setUserInfo(null);
        that.props.onLogout();
        //Cookies.remove('access_token');
        that.props.cookies.remove('access_token');
        //this.context.history.pushState(null, '/login');
        that.setState({login_success:false});
      }
    });
  }

  login(event){
    event.preventDefault();
    this.setState({login_success:false});   //???
  }

  render() {

    var token = this.props.cookies.get('access_token');
    return (
<div>
  <nav className="navbar navbar-default">
    <div className="container-fluid">

      <div className="navbar-header">
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <a className="navbar-brand" href="#">Brand</a>
      </div>


      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul className="nav navbar-nav">
          <li className="active"><a href="/">Vocabulary <span className="sr-only">(current)</span></a></li>
          <li className="active"><a href="/history">History</a></li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span className="caret"></span></a>
            <ul className="dropdown-menu">
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li role="separator" className="divider"></li>
              <li><a href="#">Separated link</a></li>
              <li role="separator" className="divider"></li>
              <li><a href="#">One more separated link</a></li>
            </ul>
          </li>
        </ul>
        <form className="navbar-form navbar-left" role="search">
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Search"  />
          </div>
          <button type="submit" className="btn btn-default">Submit</button>
        </form>
        <ul className="nav navbar-nav navbar-right">
          { this.state.username ?
              <div className="nav navbar-nav">
                <li><a href="#">Hi! {this.state.username}</a></li>
                <li><button type="button" className="btn btn-default" onClick={this.logout}>Logout</button></li>              </div>
            :
                <a href="/login" className="btn btn-default">Login</a>

          }
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span className="caret"></span></a>
            <ul className="dropdown-menu">
              <li><a href="history">History</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li role="separator" className="divider"></li>
              <li><a href="#">Separated link</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <div id="" className="container">
        <Route path="/" exact component={() => <Vocabulary username={this.state.username} />} />
        <Route path='/manage' component={Management} />
        <Route path='/history' component={() => <History username={this.state.username} />}/>
        <Route path='/login' component={Login} />
        <Route path='/register' component={Register} />
  </div>
</div>
);
  }
}

Layout.propTypes = {
}

Layout.contextTypes = {
  history: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps){
  console.log("app:mapStateToProps")
  return {
    username : state.user_info? state.user_info.username : null,
  };
};

function mapDispatchToProps(dispatch, ownProps){
  return {
      onLogout: function(){
        dispatch(logoutAction())
      },

      onReturn:function(params){
        dispatch(loginAction(params))
      }
   };
}

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(Layout));

export default withRouter(App);
