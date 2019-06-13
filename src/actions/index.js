/*
export const loginAction = (params) => {
		return {
			type: 'login',
			username: params.username,
			access_token : params.access_token
		};
}


export const logoutAction = () => {
		return {type: 'logout'}
}
*/

export function loginAction(params) {
		return {
			type: 'login',
			username: params.username,
			access_token : params.access_token
		};
}


export function logoutAction(){
		return {type: 'logout'}
}
