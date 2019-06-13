import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import astore from './reducers'
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { CookiesProvider } from 'react-cookie';

const store = createStore(astore);


ReactDOM.render(
	(<Provider store={store}>
		<BrowserRouter>
			<CookiesProvider>
				<App />
			</CookiesProvider>
		</BrowserRouter>
	 </Provider>), 
	document.getElementById('root'));
	
registerServiceWorker();
