import { NextRequest, NextResponse } from 'next/server';

// Placeholder for NextAuth - to be configured after NextAuth v5 stable release
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Auth endpoint - coming soon' });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Auth endpoint - coming soon' });
}