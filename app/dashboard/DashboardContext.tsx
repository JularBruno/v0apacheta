// import { createContext, useReducer } from 'react';
// import { initialUserState, userReducer } from './reducers/user.reducer';
// import { getProfile } from '@/lib/actions/user';

// const DashboardContext = createContext(null);

// export function DashboardProvider({ children }) {
// 	const [state, dispatch] = useReducer(userReducer, initialUserState);

// 	const fetchUser = async () => {
// 		dispatch({ type: 'USER_FETCH_START' });
// 		const profile = await getProfile();
// 		dispatch({ type: 'USER_FETCH_SUCCESS', payload: profile });
// 	};

// 	/**
// 	 * 
// 	 * User
// 	 * 
// 	 */
// 	const fetchProfile = async () => {
// 		try {
// 			dispatch({ type: 'USER_FETCH_START' });
// 			const profile = await getProfile();
// 			console.log('profile ', profile);
// 			dispatch({ type: 'USER_FETCH_SUCCESS', payload: profile });
// 		}
// 		catch (error: any) {
// 			console.log('USER DASHBOARD ERROR ', error);

// 			if (error.digest?.includes('NEXT_REDIRECT')) {
// 				toastError401();
// 				// Redirect is happening, ignore
// 				return;
// 			}
// 		} finally {
// 			setLoadingUser(false);
// 		}
// 	}

// 	const updateUser = (user) => {
// 		dispatch({ type: 'USER_UPDATE', payload: user });
// 	};

// 	return (
// 		<DashboardContext.Provider
// 			value={{
// 				user: state.user,
// 				loadingUser: state.loading,
// 				fetchProfile,
// 				updateUser,
// 			}}
// 		>
// 			{children}
// 		</DashboardContext.Provider>
// 	);
// }

