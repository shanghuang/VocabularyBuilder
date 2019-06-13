function user_info(state,action){
	switch(action.type){
	case 'login':
		return {
			username : action.username,
			access_token : action.access_token,
		};

	case 'logout':
		return {
			username : null,
			access_token : null,
		};

	default:
		return {};
	}
}

export default user_info;