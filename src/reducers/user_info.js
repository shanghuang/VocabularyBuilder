function user_info(state,action){
	switch(action.type){
	case 'login':
		return {
			email : action.email,
			access_token : action.access_token,
		};

	case 'logout':
		return {
			email : null,
			access_token : null,
		};

	default:
		return {};
	}
}

export default user_info;