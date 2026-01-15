export type UserState = {
	user: any | null;
	loading: boolean;
};

export type UserAction =
	| { type: 'USER_FETCH_START' }
	| { type: 'USER_FETCH_SUCCESS'; payload: any }
	| { type: 'USER_UPDATE'; payload: any };

export const initialUserState: UserState = {
	user: null,
	loading: false,
};

export function userReducer(state: UserState, action: UserAction): UserState {
	switch (action.type) {
		case 'USER_FETCH_START':
			return { ...state, loading: true };

		case 'USER_FETCH_SUCCESS':
			return { user: action.payload, loading: false };

		case 'USER_UPDATE':
			return { ...state, user: action.payload };

		default:
			return state;
	}
}
