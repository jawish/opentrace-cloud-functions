import * as express from 'express';
import * as cors from 'cors';
import * as bearerToken from 'express-bearer-token';

import router from './routes';

// Instantiate a new express app
export const app = express();

// Set CORS handling
app.use(cors({ origin: '*' }));

// Set bearer token extraction
app.use(bearerToken());

// Parse application/json
app.use(express.json())

// Load the routes
app.use('/', router);
