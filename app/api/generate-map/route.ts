import { NextRequest, NextResponse } from 'next/server';
import { generateMindMap } from '@/lib/gemini';
import type { LayoutMode } from '@/lib/types';

/** Tempo máximo para a rota (geração com documento pode levar 2–3 min). */
export const maxDuration = 300;

interface Body {
  prompt: string;
  attachment?: { base64: string; mimeType: string; name: string };
  options?: {
    layoutMode?: LayoutMode;
    addExtraTexts?: boolean;
    addReferenceImages?: boolean;
    addNumberedSequence?: boolean;
    planLevel?: 'essencial' | 'creator' | 'pro';
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const { prompt, attachment, options } = body;
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Campo "prompt" é obrigatório' },
        { status: 400 }
      );
    }
    const mapData = await generateMindMap(
      prompt.trim(),
      attachment,
      {
        addExtraTexts: options?.addExtraTexts,
        addReferenceImages: options?.addReferenceImages,
        addNumberedSequence: options?.addNumberedSequence,
        planLevel: options?.planLevel ?? 'essencial',
        layoutMode: options?.layoutMode,
      }
    );
    if (options?.layoutMode) mapData.layoutMode = options.layoutMode;
    return NextResponse.json(mapData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar mapa';
    console.error('[generate-map]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
