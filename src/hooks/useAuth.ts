import { useCallback, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, setUser } from '@Action/user.action';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from '@Action/auth.action';
import { RootDispatch, RootStateType } from '@Type/store';
import Firebase, { authKey } from '@Service/firebase/init';
import { setLoginError, setLoginSuccess, setLogout } from '@Store/reducers/auth.reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetStore } from '@Store/reducers';
import { UserInterface } from '@Type/user';

/**
 * @description Hook for authentication -> Checks the user's authentication state
 */
const useAuth = () => {
	const dispatch = useDispatch<RootDispatch>();
	const { user: currentUser } = useSelector((state: RootStateType) => state.user);
	const auth = new Firebase().auth;
	let unsubscribeUserDoc: (() => void) | null = null;

	/**
	 * @description Listens for authentication state changes
	 */
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
			try {
				if (user) {
					const token = await user.getIdToken();

					if (token) {
						dispatch(getUser(user.uid));
						loginState();
						onUserStateChange(user.uid);
					} else {
						logoutState();
					}
				} else {
					logoutState();
				}
			} catch (error) {
				console.error('Error during authentication:', error);
				logoutState();
			}
		});

		return () => {
			unsubscribe();
		}
	}, [dispatch]);

	/**
	 * @description Listens for user state changes
	 * @param userUID
	 */
	const onUserStateChange = useCallback((userUID: string) => {
		const db = new Firebase().db;

		const userDocRef = doc(db, 'users', userUID);

		unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
			if (doc.exists()) {
				const user = doc.data() as UserInterface;

				if (user !== currentUser) {
					dispatch(setUser(user));
				}
			} else {
				logoutState();
			}
		}, (error) => {
			console.log(error);
		});
	}, [currentUser])

	const logout = async () => {
		dispatch(setLogout());
		dispatch(resetStore());

		if (unsubscribeUserDoc) {
			unsubscribeUserDoc();
		}

		await signOut();
	}

	/**
	 * @description Checks the user's authentication only once
	 */
	const checkAuth = useCallback(() => {
		new Promise(resolve => setTimeout(resolve, 500)).then(async () => {
			try {
				const storedUser = await AsyncStorage.getItem(authKey);
				if (storedUser) {
					const parsedData = JSON.parse(storedUser);
					const token = parsedData.stsTokenManager.accessToken;

					if (token) {
						loginState();
					} else {
						logoutState();
					}
				} else {
					logoutState();
				}
			} catch (error) {
				console.error('Error during authentication:', error);
				dispatch(setLoginError());
			}
		});
	}, [dispatch]);

	/**
	 * @description Logs in the user
	 */
	const loginState = () => {
		dispatch(setLoginSuccess());
	}

	/**
	 * @description Logs out the user
	 */
	const logoutState = () => {
		dispatch(setLogout());
	}

	return {
		checkAuth, logout
	}
}

export default useAuth;
