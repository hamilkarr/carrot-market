import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

interface SessionContent {
    id?: number;
}

export function getSession() {
    return getIronSession<SessionContent>(cookies(), {
        cookieName: 'delicious-carrot',
        password: process.env.COOKIE_PASSWORD!,
    });
}

export async function setSession(userId: number) {
    const session = await getSession();
    session.id = userId;
    await session.save();
}
