import { NextResponse } from 'next/server';
import { getCompetency } from '@/lib/content';

export async function GET() {
  const c = getCompetency("revisao-da-literatura");
  return NextResponse.json(c);
}
