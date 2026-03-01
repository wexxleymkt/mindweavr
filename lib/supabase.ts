import { createClient } from '@supabase/supabase-js';
import { MapGeneration, MapData } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveGeneration(
  title: string,
  prompt: string,
  mapData: MapData,
  userId?: string | null
): Promise<MapGeneration | null> {
  try {
    const { data, error } = await supabase
      .from('map_generations')
      .insert({ title, prompt, map_data: mapData, user_id: userId ?? null })
      .select()
      .single();

    if (error) {
      console.warn('Supabase save error:', error.message || error);
      return null;
    }
    return data as MapGeneration;
  } catch (e) {
    console.warn('Save failed:', e);
    return null;
  }
}

export async function getGenerations(userId?: string | null): Promise<MapGeneration[]> {
  try {
    let query = supabase
      .from('map_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase fetch error:', error.message || error);
      return [];
    }
    return (data as MapGeneration[]) || [];
  } catch (e) {
    console.warn('Fetch failed:', e);
    return [];
  }
}

export async function deleteGeneration(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('Delete failed: user not authenticated');
      return false;
    }

    const { error, count } = await supabase
      .from('map_generations')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Supabase delete error:', error.message || error);
      return false;
    }
    return (count ?? 0) > 0 || count === null;
  } catch (e) {
    console.warn('Delete failed:', e);
    return false;
  }
}

export async function updateGenerationTitle(id: string, title: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('map_generations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// Ativa ou desativa o compartilhamento público de um mapa.
// Ao ativar, gera um share_token único via gen_random_uuid().
// Ao desativar, mantém o token (pode ser reativado) mas seta is_public = false.
export async function toggleShareMap(
  id: string,
  enable: boolean
): Promise<{ share_token: string | null; is_public: boolean } | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let updatePayload: Record<string, unknown>;

    if (enable) {
      // Primeiro verifica se já tem token; se não, gera um novo via SQL
      const { data: current } = await supabase
        .from('map_generations')
        .select('share_token')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      const token = current?.share_token ?? crypto.randomUUID();
      updatePayload = { is_public: true, share_token: token };
    } else {
      updatePayload = { is_public: false };
    }

    const { data, error } = await supabase
      .from('map_generations')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('share_token, is_public')
      .single();

    if (error) {
      console.warn('toggleShareMap error:', error.message);
      return null;
    }
    return data as { share_token: string | null; is_public: boolean };
  } catch (e) {
    console.warn('toggleShareMap failed:', e);
    return null;
  }
}

// Busca um mapa público pelo share_token (sem autenticação)
export async function getPublicMap(token: string): Promise<MapGeneration | null> {
  try {
    const { data, error } = await supabase
      .from('map_generations')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single();

    if (error) return null;
    return data as MapGeneration;
  } catch {
    return null;
  }
}
