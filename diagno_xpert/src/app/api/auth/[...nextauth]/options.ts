import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from 'next-auth';
import DbConnection from "@/lib/DatabaseConnect";
import User from "@/models/user.models";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: { params: { prompt: "consent" } },
            httpOptions: {
                timeout: 10000,
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" },
            },
            async authorize(credentials) {
                await DbConnection();

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                return user;
            }

        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await DbConnection();
                let existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    existingUser = await User.create({
                        username: user.name || user?.email?.split("@")[0],
                        email: user.email,
                        oauth: true,
                        profilePicture: {
                            Url: (profile as any)?.picture || user.image || "/default-avatar.svg",
                        },
                    });
                }
                user._id = existingUser._id;
                user.username = existingUser.username;
                user.profilePicture = existingUser.profilePicture.url;
                user.role = existingUser.role;

            }

            return true;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user._id = token._id || token.sub;
                session.user.email = token.email as string;
                session.user.username = token.username as string;
                session.user.profilePicture = token.profilePicture as string;
                session.user.role = token.role as string;
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token._id = (user as any)._id || token.sub;
                token.email = user.email || undefined;
                token.username = user.username || undefined;
                token.profilePicture = user.profilePicture;
                token.role = user.role || undefined;
            }

            // Refresh role from DB on every request to pick up role changes
            if (token._id) {
                await DbConnection();
                const dbUser = await User.findById(token._id).select("role username profilePicture");
                if (dbUser) {
                    token.role = dbUser.role;
                    token.username = dbUser.username;
                    token.profilePicture = dbUser.profilePicture.url;
                }
            }

            return token
        }
    },
    jwt: {
        maxAge: 60 * 60 * 24 * 7,
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/signin",
    },
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        sessionToken: {
            name: "userLogin",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
};