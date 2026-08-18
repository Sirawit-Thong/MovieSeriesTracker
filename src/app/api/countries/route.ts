import {NextResponse} from 'next/server';
import {getAllCountries} from '@/lib/db/media-queries';

export async function GET() {
  const countries = await getAllCountries();
  return NextResponse.json(countries);
}
