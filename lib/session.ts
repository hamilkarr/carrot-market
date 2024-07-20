import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

interface SessionContent {
    id?: number;
}

export function getSession() {
    return getIronSession<SessionContent>(cookies(), {
        cookieName: 'delicious-carrot',
        // 쿠키의 암호화를 위한 비밀 키
        password: process.env.COOKIE_PASSWORD!,
    });
}

export async function setSession(userId: number) {
    const session = await getSession();
    session.id = userId;
    await session.save();
}
