/**
 * @file This file defines the main router for the application. It consolidates
 * other resource-specific routers and exports a single, configured router to be
 * used by the main Express app.
 */

// Imports the Router factory function from Express to create a new router object.
import { Router } from 'express';

// Imports the route path constant for the cart (e.g., '/cart').
import { CART } from '../constants/routes.const.js';
// Imports the router responsible for handling all cart-related routes.
import { cartRouter } from './cart.router.js';

/**
 * Initializes and exports the main Express router with specific configurations.
 * @type {import('express').Router}
 */
export const mainRouter = Router({
    /**
     * @property {boolean} caseSensitive - If true, treats '/users' and '/Users' as different routes.
     */
    caseSensitive: true,
    /**
     * @property {boolean} mergeParams - If true, merges `req.params` from parent and child routers.
     */
    mergeParams: true,
    /**
     * @property {boolean} strict - If true, differentiates between paths with and without a trailing slash (e.g., '/cart' vs '/cart/').
     */
    strict: true,
});

/**
 * --- Sub-router Mounting ---
 * Mounts the `cartRouter` as middleware on the `mainRouter`. All routes defined
 * within `cartRouter` will now be prefixed with the `CART` path constant.
 */
mainRouter.use(CART, cartRouter);
