import { NextResponse } from 'next/server';
import { getCompetencies } from '@/lib/content';

export async function GET() {
  const c = getCompetencies();
  return NextResponse.json(c);
}
