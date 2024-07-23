'use server';

import db from '@/lib/db';
import { redirect } from 'next/navigation';

export async function deleteProduct(id: number) {
    const result = await db.product.delete({
        where: {
            id: 2,
        },
    });
    // console.log(result);
    return redirect('/products');
}
