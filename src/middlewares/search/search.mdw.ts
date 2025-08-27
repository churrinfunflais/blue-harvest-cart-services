import { create, insertMultiple, search } from '@orama/orama';
import { NextFunction, Request, Response } from 'express';

import { index } from '../../assets/index.js';

const searchInstance = create({
    schema: {
        id: 'string',
        productDescription: 'string',
        productName: 'string',
    },
});

await insertMultiple(searchInstance, index);

const textSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const results = await search(searchInstance, {
            term: req.query.textSearch as string,
        });

        res.send(results);
    } catch (error) {
        next(error);
    }
};

export default textSearch;
