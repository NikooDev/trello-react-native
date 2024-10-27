import { Photo, PhotosWithTotalResults } from 'pexels';
import client from '@Service/pexels/init';
import { queryThemesPexels } from '@Util/constants';

/**
 * @description Get a photo by id
 * @param id
 */
export const getPhoto = async (id: string | number): Promise<{ valid: boolean, photo: Photo }> => {
	try {
		const photo = await client.photos.show({ id }) as Photo;

		return {
			valid: true,
			photo
		}
	} catch (err) {
		console.log(err);

		return {
			valid: false,
			photo: {} as Photo
		}
	}
}

/**
 * @description Search photos
 * @param per_page
 */
export const searchPhoto = async (per_page?: number): Promise<{ valid: boolean, photos: PhotosWithTotalResults }> => {
	try {
		const randomQuery = queryThemesPexels[Math.floor(Math.random() * queryThemesPexels.length)];
		const randomPage = Math.floor(Math.random() * 10) + 1;

		const photos = await client.photos.search({ query: randomQuery, page: randomPage, per_page }) as PhotosWithTotalResults;

		return {
			valid: true,
			photos
		}
	} catch (err) {
		console.log(err);

		return {
			valid: false,
			photos: {} as PhotosWithTotalResults
		}
	}
}
