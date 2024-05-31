import db from '@/lib/db';
import getSession from '@/lib/session';
import { notFound, redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    if (!code) {
        return notFound();
    }

    let accessTokenURL = 'https://github.com/login/oauth/access_token';
    const accessTokenParams = {
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
    };
    accessTokenURL += '?' + new URLSearchParams(accessTokenParams).toString();
    const accessTokenResponse = await fetch(accessTokenURL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
    });
    const { error, access_token } = await accessTokenResponse.json();

    if (error) {
        return new Response(null, {
            status: 400,
        });
    }
    const userProfileResponse = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        cache: 'no-cache',
    });
    const { id, avatar_url, login } = await userProfileResponse.json();

    const user = await db.user.findUnique({
        where: {
            github_id: String(id),
        },
        select: {
            id: true,
        },
    });
    if (user) {
        const session = await getSession();
        session.id = user.id;
        await session.save();
        return redirect('/profile');
    }
    const newUser = await db.user.create({
        data: {
            github_id: String(id),
            avatar: avatar_url,
            username: login,
        },
        select: {
            id: true,
        },
    });
    const session = await getSession();
    session.id = newUser.id;
    await session.save();
    return redirect('/profile');
}
