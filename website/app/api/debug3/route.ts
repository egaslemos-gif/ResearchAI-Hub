import { NextResponse } from 'next/server';
import { generateStaticParams } from '@/app/competencias/[slug]/passo/[n]/page';

export async function GET() {
  const c = generateStaticParams();
  return NextResponse.json(c);
}
