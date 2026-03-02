import { NextResponse } from 'next/server';
import { REPLICATE_MODEL } from '@/lib/replicate';

/** Retorna o modelo de IA em uso (Replicate – Gemini 2.5 Flash). Confirma que a geração usa esse modelo. */
export async function GET() {
  return NextResponse.json({
    provider: 'replicate',
    model: REPLICATE_MODEL,
    description: 'Gemini 2.5 Flash via Replicate — usado em /api/generate-map, generateMindMap, generateCardNode e generateNodeExpansion',
  });
}
