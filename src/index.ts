import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { CORS_ORIGIN, PORT } from './config.js';
import { API } from './constants/paths.const.js';
import { SIZE_1_MB } from './constants/strings.const.js';
import { errorHandler } from './middlewares/utils/error.mdw.js';
import { logger } from './middlewares/utils/logger.mdw.js';
import user from './middlewares/workspace/user.mdw.js';
import workspace from './middlewares/workspace/workspace.mdw.js';
import { mainRouter } from './routers/main.router.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(compression());
app.use(express.json({ limit: SIZE_1_MB }));
app.use(express.urlencoded({ extended: true, limit: SIZE_1_MB }));
app.use(logger, workspace, user);

app.use(API, mainRouter);

app.use(errorHandler);

app.listen(PORT);
