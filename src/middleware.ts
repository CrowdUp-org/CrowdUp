import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware passthrough - client-side auth doesn't require middleware layer
// If middleware is needed in the future, add logic here
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
