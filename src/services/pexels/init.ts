import { createClient } from 'pexels';
import pexels from '@Config/pexels';

const client = createClient(pexels.apiKey);

export default client;
