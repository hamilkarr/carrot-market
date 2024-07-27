import ListProduct from '@/components/list-product';
import ProductList from '@/components/product-list';
import db from '@/lib/db';
import { Prisma } from '@prisma/client';

async function getInitialProducts() {
    const products = await db.product.findMany({
        select: {
            title: true,
            price: true,
            create_at: true,
            photo: true,
            id: true,
        },
        take: 1,
        orderBy: {
            create_at: 'desc',
        },
    });
    return products;
}

export type initialProducts = Prisma.PromiseReturnType<
    typeof getInitialProducts
>;

export default async function Products() {
    const initialProducts = await getInitialProducts();
    return (
        <div>
            <ProductList initialProducts={initialProducts} />
        </div>
    );
}
