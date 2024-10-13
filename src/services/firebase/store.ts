import Firebase from '@Service/firebase/init';
import {
	CollectionReference, Timestamp, Firestore,
	doc, getDoc, getDocs, query, where, or, limit, limitToLast,
	orderBy, collection, setDoc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { CreatedInterface, LimitSearchParameter, OrSearchParameter, SortSearchParameter, WhereSearchParameter } from '@Type/firestore';

/**
 * @description Firestore service class
 * @param T
 * @author Nicolas Tual
 */
class FirstoreService<T> {
	private readonly collectionName: string;
	private readonly db: Firestore = new Firebase().db;

	constructor(collectionName: string) {
		this.collectionName = collectionName;
	}

	/**
	 * @description Get a document from a collection
	 * @param uid
	 */
	public async getDocument<T extends CreatedInterface>(uid: string): Promise<T | null> {
		const ref = doc(this.db, this.collectionName, uid);
		try {
			const docSnap = await getDoc(ref);

			if (docSnap.exists()) {
				const data = docSnap.data();
				if (data.created) {
					data.created = this.transformDate(data.created);
				}

				return data as T;
			}

			return null;
		} catch (err) {
			console.error('Error getting document:', err);
			return null;
		}
	}

	/**
	 * @description Search documents in a collection
	 * @param queries
	 */
	public async search<T extends CreatedInterface>(queries: (WhereSearchParameter | OrSearchParameter | SortSearchParameter | LimitSearchParameter)[]): Promise<T[]> {
		const ref = collection(this.db, this.collectionName);
		let queryRef = query(ref);

		queries.forEach(queryParam => {
			if ((queryParam as WhereSearchParameter).where) {
				const { where: field, operator, value } = queryParam as WhereSearchParameter;
				queryRef = query(queryRef, where(field, operator, value));
			}

			if ((queryParam as OrSearchParameter).or) {
				const orConditions = (queryParam as OrSearchParameter).or;
				const orClause = or(...orConditions.map(cond => where(cond.where, cond.operator, cond.value)));
				queryRef = query(queryRef, orClause);
			}

			if ((queryParam as SortSearchParameter).sortBy) {
				const { sortBy, direction } = queryParam as SortSearchParameter;
				queryRef = query(queryRef, orderBy(sortBy, direction));
			}

			if ((queryParam as LimitSearchParameter).limit) {
				const { limit: maxResults, limitToLast: isLimitToLast } = queryParam as LimitSearchParameter;
				if (isLimitToLast) {
					queryRef = query(queryRef, limitToLast(maxResults));
				} else {
					queryRef = query(queryRef, limit(maxResults));
				}
			}
		});

		try {
			const querySnapshot = await getDocs(queryRef);

			return querySnapshot.docs.map(doc => {
				const data = {
					id: doc.id,
					...doc.data() as T,
				} as T;

				if (data.created) {
					data.created = this.transformDate(data.created);
				}

				return data;
			});
		} catch (err) {
			console.error(err);
			return [];
		}
	}

	/**
	 * @description Get all documents from a collection
	 */
	public async list<T extends CreatedInterface>(): Promise<T[]> {
		const ref = collection(this.db, this.collectionName);
		try {
			const querySnapshot = await getDocs(ref);

			return querySnapshot.docs.map(doc => {
				const data = {
					id: doc.id,
					...doc.data() as T,
				} as T;

				if (data.created) {
					data.created = this.transformDate(data.created);
				}

				return data;
			});
		} catch (err) {
			console.error(err);
			return [];
		}
	}

	/**
	 * @description Create a document in a collection
	 * @param data
	 */
	public async createDocument<T extends { uid?: string | null }>(data: T): Promise<{ valid: boolean, uid: string | null }> {
		try {
			const ref = collection(this.db, this.collectionName) as CollectionReference<T>;

			const newDocRef = doc(ref);
			const generatedId = newDocRef.id;
			const isDataUIDExist = data.uid ? data.uid : generatedId;

			if (!data.uid) {
				data.uid = generatedId;
			}

			await setDoc(doc(ref, isDataUIDExist), data);

			return {
				valid: true,
				uid: generatedId
			};
		} catch (err) {
			console.error('Error creating document:', err);

			return {
				valid: false,
				uid: null
			};
		}
	}

	/**
	 * @description Update a document in a collection
	 * @param uid
	 * @param data
	 */
	public async updateDocument(uid: string, data: Partial<T>): Promise<Partial<T> | null> {
		try {
			const ref = doc(this.db, this.collectionName, uid);

			await updateDoc(ref, data);

			return data;
		} catch (err) {
			console.error('Error updating document:', err);
			return null;
		}
	}

	/**
	 * @description Delete a document from a collection
	 * @param uid
	 */
	public async deleteDocument(uid: string): Promise<string | null> {
		try {
			const ref = doc(this.db, this.collectionName, uid);

			await deleteDoc(ref);

			return uid;
		} catch (err) {
			console.error('Error deleting document:', err);
			return null;
		}
	}

	/**
	 * @description Transform Firestore Timestamp to Date
	 * @param created
	 * @private
	 */
	private transformDate(created: Date | Timestamp): Date | null {
		if (created && typeof created === 'object' && 'seconds' in created) {
			return new Date(created.seconds * 1000);
		}
		return null;
	}
}

export default FirstoreService;
