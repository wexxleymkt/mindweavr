import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  try {
    const [v1, v1beta] = await Promise.all([
      fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`).then(r => r.json()),
      fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`).then(r => r.json()),
    ]);

    const v1Models = (v1?.models ?? []).map((m: { name: string }) => m.name);
    const betaModels = (v1beta?.models ?? []).map((m: { name: string }) => m.name);

    return NextResponse.json({ v1: v1Models, v1beta: betaModels });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
