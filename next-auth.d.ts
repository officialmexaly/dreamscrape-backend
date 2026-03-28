import { RouteHandler } from 'next';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface NextAuthOptions {
    // Add any custom options here
  }
}

// Type augmentation for NextAuth route handler
type NextAuthRouteHandler = RouteHandler<{
  output: 'next-auth';
}>;
