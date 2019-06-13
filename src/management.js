import React, { Component } from 'react'
import { BrowserRouter, Link } from 'react-router-dom'
import { withCookies, Cookies } from 'react-cookie'
import PropTypes, {instanceOf} from 'prop-types';

class Management extends Component{
	static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    componentWillMount(){
        var access_token = this.props.cookies.get('access_token');
        if( !access_token){
            //this.props.history.push('/login');
        }
        else{
            
        }
    }

	render(){
		return(
			<div>
                <div id="wrapper">
    				<div id="sidebar-wrapper" className="col-lg-3">
                        <ul className="sidebar-nav">
                            <li className="sidebar-brand">
                                <Link to='/manage/user'>
                                    User
                                </Link>
                            </li>
                            <li>
                                <Link to='/manage/tutor'>
                                    Tutor
                                </Link>
                            </li>
                            <li>
                                <Link to='/manage/test'>
                                    Test
                                </Link>
                            </li>
                            <li>
                                <Link to='/manage/post'>
                                    Post
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div id="" className="col-lg-9">
					
				</div>
			</div>
	)}
}


export default withCookies(Management);