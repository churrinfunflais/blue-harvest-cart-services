/**
 * @file This file sets up and configures an Express.js server.
 * It imports necessary third-party and local modules to handle middleware,
 * routing, and error handling before starting the server.
 */

// Third-Party Modules
import compression from 'compression'; // Middleware that compresses response bodies for better performance.
import cors from 'cors'; // Middleware to enable Cross-Origin Resource Sharing (CORS).
import express from 'express'; // The core framework for building the web server.
import helmet from 'helmet'; // Middleware that helps secure the app by setting various HTTP headers.

// Local Modules & Constants
import { CORS_ORIGIN, PORT } from './config.js'; // Configuration variables for PORT and allowed CORS origins.
import { API_V1 } from './constants/routes.const.js'; // A constant for the API version route prefix (e.g., '/api/v1').
import { errorHandler } from './middlewares/utils/errorHandler.mdw.js'; // Custom middleware for handling errors.
import { mainRouter } from './routers/main.router.js'; // The main router for the application.

/**
 * Initializes a new Express application.
 * Exported for testing or for use in other parts of the application.
 * @type {import('express').Express}
 */
export const app = express();

// --- Middleware Configuration ---
// The following middleware functions are applied to all incoming requests in order.

// Adds a layer of security by setting various HTTP headers to protect against common vulnerabilities.
app.use(helmet());

// Configures CORS to only allow requests from the origin specified in the CORS_ORIGIN environment variable.
app.use(cors({ origin: CORS_ORIGIN }));

// Compresses HTTP responses before sending them to the client to improve performance.
app.use(compression());

// Parses incoming requests with JSON payloads.
app.use(express.json());

// Parses incoming requests with URL-encoded payloads. `extended: true` allows for rich objects and arrays.
app.use(express.urlencoded({ extended: true }));

/**
 * --- Routing ---
 * Mounts the `mainRouter` to the path specified by the `API_V1` constant.
 * Any route defined within `mainRouter` will be prefixed with the `API_V1` path.
 */
app.use(API_V1, mainRouter);

/**
 * --- Error Handling ---
 * Registers the custom `errorHandler` middleware. It is placed after all routing
 * so it can catch and handle any errors that occur in the preceding middleware or route handlers.
 */
app.use(errorHandler);

/**
 * --- Server Initialization ---
 * Starts the server and makes it listen for incoming connections on the specified port.
 */
app.listen(PORT);
