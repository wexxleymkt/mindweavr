import Replicate from 'replicate';
import { MapData, MapAnnotations, MapNode, VisualType } from './types';
import { buildMindMapPromptText, buildSystemPrompt } from './gemini';
import type { GenerateMindMapOptions } from './gemini';

/** Modelo usado para geração de mapas — Gemini 2.5 Flash via Replicate (única fonte). */
export const REPLICATE_MODEL = 'google/gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 180_000;
const MAX_OUTPUT_TOKENS = 16384;

export interface Attachment {
  base64: string;
  mimeType: string;
  name: string;
}

async function runGeminiReplicate(
  prompt: string,
  options?: { images?: string[]; system_instruction?: string }
): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN não configurado. Defina no .env.local.');
  }

  const replicate = new Replicate({ auth: token });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const input: Record<string, unknown> = {
    prompt,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.65,
  };
  if (options?.system_instruction) {
    input.system_instruction = options.system_instruction;
  }
  if (options?.images?.length) {
    input.images = options.images;
  }

  let output: unknown;
  try {
    output = await replicate.run(REPLICATE_MODEL, {
      input,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`A geração demorou mais de ${REQUEST_TIMEOUT_MS / 1000}s. Tente novamente.`);
    }
    throw e;
  }

  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return output.map((c) => (typeof c === 'string' ? c : String(c ?? ''))).join('');
  if (output != null && typeof output === 'object' && 'output' in output && typeof (output as { output: unknown }).output === 'string') {
    return (output as { output: string }).output;
  }
  if (output != null && typeof output === 'object' && 'text' in output && typeof (output as { text: unknown }).text === 'string') {
    return (output as { text: string }).text;
  }
  if (output != null && typeof (output as { toString?: () => string }).toString === 'function') {
    return (output as { toString: () => string }).toString();
  }
  return String(output ?? '');
}

/**
 * Gera o mapa mental via Replicate (Gemini 2.5 Flash).
 * Suporta anexo de imagem; documento não-imagem usa só o prompt.
 */
export async function generateMindMap(
  prompt: string,
  attachment?: Attachment | null,
  options?: GenerateMindMapOptions
): Promise<MapData> {
  const fullPrompt = buildMindMapPromptText(prompt.trim(), attachment ?? undefined, options);
  const images: string[] = [];
  if (attachment?.base64 && attachment?.mimeType?.startsWith('image/')) {
    images.push(`data:${attachment.mimeType};base64,${attachment.base64}`);
  }

  const text = await runGeminiReplicate(fullPrompt, { images });
  if (!text.trim()) throw new Error('Resposta vazia da IA.');

  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as MapData & { annotations?: MapAnnotations };
  const data: MapData = {
    title: parsed.title,
    description: parsed.description,
    rootNode: parsed.rootNode,
    theme: parsed.theme,
    layoutMode: parsed.layoutMode,
    connectionStyle: parsed.connectionStyle,
  };
  if (parsed.annotations && typeof parsed.annotations === 'object') {
    data.annotations = {
      arrows: Array.isArray(parsed.annotations.arrows) ? parsed.annotations.arrows : undefined,
      texts: Array.isArray(parsed.annotations.texts) ? parsed.annotations.texts : undefined,
      images: Array.isArray(parsed.annotations.images) ? parsed.annotations.images : undefined,
    };
  }
  return data;
}

/** Gera um único nó (card) para inserir no mapa. */
export async function generateCardNode(
  visualType: VisualType,
  topic: string,
  planLevel?: 'essencial' | 'creator' | 'pro'
): Promise<Partial<MapNode>> {
  const sysPromptForCard = buildSystemPrompt(planLevel);
  const prompt = `${sysPromptForCard}

Agora, em vez de um mapa completo, você deve gerar APENAS UM NÓ (um card) para ser inserido em um mapa já existente.

REQUISITOS:
- O nó deve usar EXATAMENTE o visualType "${visualType}".
- Tema central do card (em poucas palavras): "${topic}".
- Crie um conteúdo coerente, útil e DIDÁTICO sobre esse tema.
- Use PORTUGUÊS BRASILEIRO.

RETORNO:
- Retorne APENAS um JSON de um objeto compatível com MapNode, contendo no mínimo:
  {
    "label": "Título curto do card",
    "description": "Frase ou texto curto explicando o card (opcional dependendo do tipo)",
    "icon": "NomeDoÍconeLucide",
    "type": "leaf",
    "visualType": "${visualType}",
    ...campos específicos desse visualType (statValue, bars, steps, listItems, etc.)
  }
- NÃO retorne rootNode, nem children do pai. Apenas o objeto do nó.
- Nenhum texto extra fora do JSON, nenhum markdown.
`;

  const text = await runGeminiReplicate(prompt);
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as Partial<MapNode>;
}

/** Gera um novo nó complementar (botão "+ Conteúdo"). */
export async function generateNodeExpansion(
  baseNode: MapNode,
  planLevel?: 'essencial' | 'creator' | 'pro'
): Promise<Partial<MapNode>> {
  const clone: MapNode = { ...baseNode, children: undefined };
  const snippet = JSON.stringify(clone, null, 2);
  const sysPromptForExpansion = buildSystemPrompt(planLevel);
  const prompt = `${sysPromptForExpansion}

Agora você NÃO vai criar um mapa completo, apenas UM novo nó complementar.

Nó de referência (JSON):
${snippet}

TAREFA:
- Crie UM novo nó que aprofunda ou complementa ESPECIFICAMENTE esse nó.
- O conteúdo deve ser diferente (outro ângulo, exemplo, métrica, insight ou desdobramento).
- Use o tipo visual que melhor representa esse novo conteúdo, seguindo as mesmas regras.

RESTRIÇÕES:
- Retorne APENAS o JSON do novo nó, sem campo "id" e sem campo "children".
- Mantenha todo o texto em português brasileiro.
- Siga o mesmo schema de MapNode (label, description, type, icon, visualType, e campos específicos).
`;

  const text = await runGeminiReplicate(prompt);
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as Partial<MapNode>;
}
