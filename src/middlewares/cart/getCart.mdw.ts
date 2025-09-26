import { NextFunction, Request, Response } from 'express';

import { documentClient } from '../../clients/dax.client.js';
import { DocumentController } from '../../controllers/document.controller.js';
import { Cart } from '../../schemas/cart.schema.js';

export const getCart = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.time('getCart');
        const documentsController = new DocumentController(documentClient, 'HEB_PAYLOOT');

        const [cart] = await Promise.all([
            documentsController.get<Cart>().key({ dataEntity: 'DEALS', documentId: 'prime' }),
            documentsController.get<Cart>().key({ dataEntity: 'DEALS', documentId: '2364888' }),
            documentsController.get<Cart>().key({ dataEntity: 'DEALS', documentId: '2952875' }),
        ]);

        console.timeEnd('getCart');

        res.data = { cart };
        next();
    } catch (error) {
        next(error);
    }
};
