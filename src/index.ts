import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { CORS_ORIGIN, PORT } from './config.js';
import { API } from './constants/routes.const.js';
import { errorHandler } from './middlewares/utils/errorHandler.mdw.js';
import { mainRouter } from './routers/main.router.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(API, mainRouter);

app.use(errorHandler);

app.listen(PORT);
