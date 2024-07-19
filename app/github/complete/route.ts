import db from '@/lib/db';
import getSession from '@/lib/session';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

class GitHubOAuthHandler {
    private clientId: string;
    private clientSecret: string;

    constructor() {
        this.clientId = process.env.GITHUB_CLIENT_ID!;
        this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    }

    async handleRequest(request: NextRequest) {
        const code = request.nextUrl.searchParams.get('code');
        if (!code) {
            return new Response(null, {
                status: 400,
            });
        }

        const { error, access_token } = await this.fetchAccessToken(code);
        if (error) {
            return new Response(null, {
                status: 400,
            });
        }

        const { id, avatar_url, login } = await this.fetchGitHubUserProfile(
            access_token
        );

        const allProfile = await this.fetchGitHubUserProfile(access_token);

        console.table(allProfile);

        const userId = await this.findOrCreateUser(
            String(id),
            avatar_url,
            login
        );
        await this.handleSession(userId);

        return redirect('/profile');
    }

    private async fetchAccessToken(code: string) {
        const accessTokenURL = 'https://github.com/login/oauth/access_token';
        const accessTokenParams = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
        };
        const urlWithParams =
            accessTokenURL +
            '?' +
            new URLSearchParams(accessTokenParams).toString();
        const response = await fetch(urlWithParams, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
        });
        return response.json();
    }

    private async fetchGitHubUserProfile(access_token: string) {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            cache: 'no-cache',
        });
        return response.json();
    }

    private async findOrCreateUser(
        githubId: string,
        avatarUrl: string,
        username: string
    ) {
        const user = await db.user.findUnique({
            where: {
                github_id: githubId,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            return Number(user.id);
        }

        const newUser = await db.user.create({
            data: {
                username: username,
                github_id: githubId,
                avatar: avatarUrl,
            },
            select: {
                id: true,
            },
        });

        return Number(newUser.id);
    }

    private async handleSession(userId: Number) {
        const session = await getSession();
        session.id = Number(userId);
        await session.save();
    }
}

export async function GET(request: NextRequest) {
    const handler = new GitHubOAuthHandler();
    return handler.handleRequest(request);
}
