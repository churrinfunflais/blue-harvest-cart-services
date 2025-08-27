/**
 * @file redocDef.mdw.ts
 * @description Express middleware for serving a dynamically generated Redoc API documentation page.
 */
import { NextFunction, Request, Response } from 'express';

import { API, DATA_ENTITIES, DOCS, OPENAPI_JSON } from '../../../constants/paths.const.js';

/**
 * Generates and serves a self-contained HTML page with Redoc for API documentation.
 * It builds the HTML with a custom theme and serves it.
 *
 * @param {Request} _req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {void}
 */
const redocDef = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        // --- 1. Define Custom Theme ---
        // A JSON object defining the color scheme and layout for the Redoc page is created and stringified.
        const theme = JSON.stringify({
            colors: {
                background: { main: '#282c34', secondary: '#21252b' },
                error: { main: '#e06c75' },
                gray: {
                    100: '#F5F5F5',
                    50: '#FAFAFA',
                },
                http: {
                    basic: '#71717a',
                    delete: '#ef4444',
                    get: '#22c55e',
                    head: '#d946ef',
                    link: '#06b6d4',
                    options: '#eab308',
                    patch: '#f97316',
                    post: '#3b82f6',
                    put: '#ec4899',
                },
                primary: { main: '#61afef' },
                success: { main: '#98c379' },
                text: { primary: '#abb2bf', secondary: '#5c6370' },
                warning: { main: '#e5c07b' },
            },
            rightPanel: {
                backgroundColor: '#282c34',
            },
            sidebar: {
                backgroundColor: '#121417',
                textColor: '#abb2bf',
            },
        });

        // --- 2. Generate HTML ---
        // A complete HTML document is constructed as a template literal. It includes meta tags,
        // custom styles, and the <redoc> element with its configuration.
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Data Entities API Documentation</title>
                <!-- needed for adaptive design -->
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://fonts.googleapis.com/css?family=Space+Grotesk:300,400,700|Roboto:300,400,700" rel="stylesheet">

                <!--
                Redoc doesn't change outer page styles
                -->
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: #21252b;
                        font-family: 'Space Grotesk', sans-serif;
                    }
                    h5 {
                        color: #abb2bf !important;
                    }
                    .TDHxu, .hNlDMA {
                        color: #abb2bf !important;
                    }
                    .daqcVd {
                        background: transparent !important;
                    }
                    .byyhmh, .dkThyz {
                        background: #282c34 !important;
                        border-color: #282c34 !important;
                    }
                    .eOOrSm {
                        max-width: 140px !important;
                        margin: auto;
                        margin-top: 8px;
                        margin-bottom: 8px;
                    }
                    .haRKTU {
                        display: none;
                    }
                </style>
            </head>
            <body>
                <redoc spec-url='${API}${DATA_ENTITIES}${DOCS}${OPENAPI_JSON}' theme='${theme}' expand-responses="200,201" required-props-first></redoc>
                <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
            </body>
            </html>`;

        // --- 3. Send Response ---
        // The generated HTML is sent to the client as the response.
        res.data = html;

        next();
    } catch (error) {
        // Pass any errors to the global error handler for a consistent response.
        next(error);
    }
};

export default redocDef;
