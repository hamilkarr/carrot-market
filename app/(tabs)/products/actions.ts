'use server';

import db from '@/lib/db';

export async function getMoreProducts(page: number) {
    const listSize = 1;
    const products = await db.product.findMany({
        select: {
            title: true,
            price: true,
            create_at: true,
            photo: true,
            id: true,
        },
        skip: page * listSize,
        take: listSize,
        orderBy: {
            create_at: 'desc',
        },
    });
    return products;
}
