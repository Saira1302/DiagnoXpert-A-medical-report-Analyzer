import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            _id?: string;
            email?: string;
            username?: string;
            profilePicture?: string;
            role?: string;
        } & DefaultSession["user"];
    }
    interface User {
        _id?: string;
        email?: string;
        username?: string;
        profilePicture?: string;
        role?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        email?: string;
        username?: string;
        profilePicture?: string;
        role?: string;
    }
}