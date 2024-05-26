import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';

import prismadb from '@/lib/prismadb';


export default NextAuth({
    providers: [
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
                async authorize(credentials, req) {
                    if(!credentials?.email || !credentials?.password){
                        throw new Error('Email and password required');
                    }

                    const user = await prismadb.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });

                    if(!user || !user.hashedPassword) {
                        throw new Error('Email does not exist');
                    }

                    const isCorrectPassword = await compare(
                        credentials.password, 
                        user.hashedPassword
                    );

                    if(!isCorrectPassword){
                        throw new Error('Incorrect password');
                    }
                    
                    return user;
                }
        })
    ],
    
    pages: {
        signIn: '/auth',

    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_URL,
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith(baseUrl)) {
                // 允许站内重定向
                return url;
            } else if (url === '/auth') {
                // 重定向到指定页面
                return `${baseUrl}/test`;
            }
            return baseUrl;
        },
    },
    
});