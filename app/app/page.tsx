'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { PromptInput } from '@/components/PromptInput';
import MapRenderer from '@/components/MapRenderer';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { generateMindMap, generateNodeExpansion, generateCardNode } from '@/lib/gemini';
import { getEmptyCardPlaceholder } from '@/lib/cardPreview';
import { saveGeneration, getGenerations, toggleShareMap } from '@/lib/supabase';
import { MapData, MapGeneration, LayoutMode, ConnectionStyle, MapNode, VisualType } from '@/lib/types';
import { Lock } from 'lucide-react';
import type { AttachedFile } from '@/components/PromptInput';
import { useAuth } from '@/contexts/AuthContext';
import { SocialIconsProvider } from '@/contexts/SocialIconsContext';

export default function AppPage() {
  const { user, profile } = useAuth();
  const planLevel = (profile?.plan ?? 'essencial') as 'essencial' | 'creator' | 'pro';
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMap, setCurrentMap] = useState<MapData | null>(null);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [generations, setGenerations] = useState<MapGeneration[]>([]);
  const [loadingPrompt, setLoadingPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('top-down');
  const [connectionStyle, setConnectionStyle] = useState<ConnectionStyle>('bezier');
  const [expandingNodeId, setExpandingNodeId] = useState<string | null>(null);
  const [creatingCard, setCreatingCard] = useState(false);
  const [connectionSourceAfterCreate, setConnectionSourceAfterCreate] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  useEffect(() => {
    if (user?.id) {
      getGenerations(user.id).then(setGenerations);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.email) return;
    fetch('/api/check-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
      .then(r => r.json())
      .then(({ hasActive }) => setHasActivePlan(!!hasActive))
      .catch(() => setHasActivePlan(false));
  }, [user?.email]);

  const handleGenerate = useCallback(async (
    prompt: string,
    options?: {
      layoutMode?: LayoutMode;
      connectionStyle?: ConnectionStyle;
      attachment?: AttachedFile;
      addExtraTexts?: boolean;
      addReferenceImages?: boolean;
      addNumberedSequence?: boolean;
    }
  ) => {
    if (options?.layoutMode)      setLayoutMode(options.layoutMode);
    if (options?.connectionStyle) setConnectionStyle(options.connectionStyle);
    setIsLoading(true);
    setError(null);
    setLoadingPrompt(prompt);
    setCurrentMap(null);
    try {
      const mapData = await generateMindMap(
        prompt,
        options?.attachment,
        {
          addExtraTexts: options?.addExtraTexts,
          addReferenceImages: options?.addReferenceImages,
          addNumberedSequence: options?.addNumberedSequence,
          planLevel,
          layoutMode: options?.layoutMode,
        }
      );
      if (options?.layoutMode)      mapData.layoutMode     = options.layoutMode;
      if (options?.connectionStyle) mapData.connectionStyle = options.connectionStyle;
      setCurrentMap(mapData);
      setCurrentPrompt(prompt);
      const saved = await saveGeneration(mapData.title, prompt, mapData, user?.id);
      if (saved) {
        setCurrentMapId(saved.id);
        setGenerations(prev => [saved, ...prev]);
      }
      toast.success(mapData.title, { description: 'Mapa criado e salvo' });
      setTimeout(() => setIsLoading(false), 320);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(msg);
      toast.error('Erro ao gerar mapa');
      setIsLoading(false);
    }
  }, [user?.id]);

  const handleSelectGeneration = (gen: MapGeneration) => {
    setCurrentMap(gen.map_data);
    setCurrentMapId(gen.id);
    setCurrentPrompt(gen.prompt);
    setLayoutMode(gen.map_data.layoutMode ?? 'top-down');
    setConnectionStyle(gen.map_data.connectionStyle ?? 'bezier');
    setShareToken(gen.share_token ?? null);
    setIsPublic(gen.is_public ?? false);
    setError(null);
  };

  const handleDeleteGeneration = (id: string) => {
    setGenerations(prev => prev.filter(g => g.id !== id));
  };

  const handleCreateBlank = useCallback(() => {
    const blankMap: MapData = {
      title: 'Meu Mapa',
      description: '',
      rootNode: {
        id: 'root',
        label: 'Meu Mapa',
        type: 'root',
        visualType: 'default',
        children: [],
      },
      layoutMode: 'top-down',
      connectionStyle: 'bezier',
    };
    setCurrentMap(blankMap);
    setCurrentMapId(null);
    setCurrentPrompt('');
    setLayoutMode('top-down');
    setConnectionStyle('bezier');
    setShareToken(null);
    setIsPublic(false);
    setError(null);
  }, []);

  const handleToggleShare = async (enable: boolean) => {
    if (!currentMapId) return;
    const result = await toggleShareMap(currentMapId, enable);
    if (result) {
      setShareToken(result.share_token);
      setIsPublic(result.is_public);
      // Atualiza a lista de mapas no histórico também
      setGenerations(prev => prev.map(g =>
        g.id === currentMapId
          ? { ...g, share_token: result.share_token, is_public: result.is_public }
          : g
      ));
    }
  };

  const handleNewMap = () => {
    setCurrentMap(null);
    setCurrentMapId(null);
    setShareToken(null);
    setIsPublic(false);
    setError(null);
  };

  const handleSaveMap = useCallback(async () => {
    if (!currentMap || !user?.id || isSaving) return;
    setIsSaving(true);
    try {
      if (currentMapId) {
        // Update existing
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('map_generations')
          .update({ map_data: currentMap, updated_at: new Date().toISOString() })
          .eq('id', currentMapId);
        if (error) throw error;
        setGenerations(prev => prev.map(g => g.id === currentMapId ? { ...g, map_data: currentMap } : g));
        toast.success('Mapa salvo', { description: 'Suas alterações foram salvas.' });
      } else {
        // Save as new
        const saved = await saveGeneration(currentMap.title, currentPrompt, currentMap, user.id);
        if (saved) {
          setCurrentMapId(saved.id);
          setGenerations(prev => [saved, ...prev]);
          toast.success('Mapa salvo', { description: 'Mapa adicionado ao histórico.' });
        }
      }
    } catch {
      toast.error('Erro ao salvar mapa');
    } finally {
      setIsSaving(false);
    }
  }, [currentMap, currentMapId, currentPrompt, user?.id, isSaving]);

  const findNodeById = useCallback((node: MapData['rootNode'], id: string): MapNode | null => {
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  }, []);

  const addChildNode = useCallback((root: MapNode, parentId: string, child: MapNode): MapNode => {
    if (root.id === parentId) {
      const children = [...(root.children ?? []), child];
      return { ...root, children };
    }
    if (!root.children?.length) return root;
    return {
      ...root,
      children: root.children.map(c => addChildNode(c, parentId, child)),
    };
  }, []);

  const moveNode = useCallback((root: MapNode, childId: string, newParentId: string): MapNode => {
    if (childId === newParentId) return root;

    const removeNode = (node: MapNode): { node: MapNode; removed: MapNode | null } => {
      let removed: MapNode | null = null;
      if (!node.children?.length) return { node, removed: null };
      const nextChildren: MapNode[] = [];
      for (const child of node.children) {
        if (child.id === childId) {
          removed = child;
          continue;
        }
        const res = removeNode(child);
        if (res.removed) removed = res.removed;
        nextChildren.push(res.node);
      }
      return { node: { ...node, children: nextChildren }, removed };
    };

    const insertNode = (node: MapNode, parentId: string, child: MapNode): MapNode => {
      if (node.id === parentId) {
        return { ...node, children: [...(node.children ?? []), child] };
      }
      if (!node.children?.length) return node;
      return {
        ...node,
        children: node.children.map(c => insertNode(c, parentId, child)),
      };
    };

    const { node: withoutChild, removed } = removeNode(root);
    if (!removed) return root;
    return insertNode(withoutChild, newParentId, removed);
  }, []);

  const handleExpandNode = useCallback(async (nodeId: string) => {
    if (!currentMap) return;
    try {
      const baseNode = findNodeById(currentMap.rootNode, nodeId);
      if (!baseNode) return;
      setExpandingNodeId(nodeId);
      const draft = await generateNodeExpansion(baseNode, planLevel);
      const newId = `${nodeId}-extra-${Date.now().toString(36)}`;
      const newNode: MapNode = {
        id: newId,
        label: draft.label ?? `${baseNode.label} — complemento`,
        description: draft.description,
        type: draft.type ?? 'leaf',
        icon: draft.icon ?? baseNode.icon,
        visualType: draft.visualType ?? 'default',
        statValue: draft.statValue,
        statLabel: draft.statLabel,
        statTrend: draft.statTrend,
        bars: draft.bars,
        ringValue: draft.ringValue,
        ringLabel: draft.ringLabel,
        steps: draft.steps,
        compLeft: draft.compLeft,
        compRight: draft.compRight,
        quote: draft.quote,
        listItems: draft.listItems,
        children: draft.children,
      };
      const updatedRoot = addChildNode(currentMap.rootNode, nodeId, newNode);
      setCurrentMap({ ...currentMap, rootNode: updatedRoot });
      toast.success('Novo conteúdo criado', { description: `Bloco complementar para "${baseNode.label}"` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Erro ao gerar conteúdo extra', { description: msg });
    } finally {
      setExpandingNodeId(null);
    }
  }, [currentMap, findNodeById, addChildNode]);

  const handleReparentNode = useCallback((childId: string, newParentId: string) => {
    if (!currentMap) return;
    const updatedRoot = moveNode(currentMap.rootNode, childId, newParentId);
    setCurrentMap({ ...currentMap, rootNode: updatedRoot });
    const child = findNodeById(updatedRoot, childId);
    const parent = findNodeById(updatedRoot, newParentId);
    if (child && parent) {
      toast.success('Conexão atualizada', { description: `"${child.label}" agora está ligado a "${parent.label}"` });
    }
  }, [currentMap, moveNode, findNodeById]);

  const handleReparentAnnotation = useCallback((elementId: string, newNodeId: string) => {
    if (!currentMap?.annotations) return;
    const ann = { ...currentMap.annotations };
    if (elementId.startsWith('ann-text-')) {
      const i = parseInt(elementId.slice('ann-text-'.length), 10);
      if (Number.isNaN(i) || !ann.texts?.[i]) return;
      ann.texts = ann.texts.slice();
      ann.texts[i] = { ...ann.texts[i], nodeId: newNodeId };
      setCurrentMap({ ...currentMap, annotations: ann });
      toast.success('Texto ligado a outro bloco');
    } else if (elementId.startsWith('ann-img-')) {
      const i = parseInt(elementId.slice('ann-img-'.length), 10);
      if (Number.isNaN(i) || !ann.images?.[i]) return;
      ann.images = ann.images.slice();
      ann.images[i] = { ...ann.images[i], nodeId: newNodeId };
      setCurrentMap({ ...currentMap, annotations: ann });
      toast.success('Imagem ligada a outro bloco');
    }
  }, [currentMap]);

  const handleDeleteAnnotation = useCallback((elementId: string) => {
    if (!currentMap?.annotations) return;
    const ann = { ...currentMap.annotations };
    if (elementId.startsWith('ann-text-')) {
      const i = parseInt(elementId.slice('ann-text-'.length), 10);
      if (Number.isNaN(i) || !ann.texts?.length) return;
      ann.texts = ann.texts.filter((_, idx) => idx !== i);
      setCurrentMap({ ...currentMap, annotations: ann });
    } else if (elementId.startsWith('ann-img-')) {
      const i = parseInt(elementId.slice('ann-img-'.length), 10);
      if (Number.isNaN(i) || !ann.images?.length) return;
      ann.images = ann.images.filter((_, idx) => idx !== i);
      setCurrentMap({ ...currentMap, annotations: ann });
    }
  }, [currentMap]);

  const handleCreateCard = useCallback(async (visualType: VisualType, cardPrompt: string, _parentIdOverride?: string) => {
    if (!currentMap) {
      toast.error('Crie um mapa primeiro', { description: 'Gere um mapa antes de adicionar novos cards.' });
      return;
    }
    const trimmed = cardPrompt.trim();
    const newId = `card-${Date.now().toString(36)}`;

    // Social icon: prompt holds the platform id
    if (visualType === 'social-icon') {
      const platform = trimmed || 'instagram';
      const SOCIAL_NAMES: Record<string, string> = {
        instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp',
        tiktok: 'TikTok', youtube: 'YouTube', twitter: 'Twitter/X',
        linkedin: 'LinkedIn', telegram: 'Telegram', email: 'E-mail',
        mensagem: 'Mensagem', reels: 'Reels', post: 'Post', stories: 'Stories',
        shorts: 'Shorts', podcast: 'Podcast', blog: 'Blog', site: 'Site',
      };
      const newNode: MapNode = {
        id: newId, label: SOCIAL_NAMES[platform] ?? platform,
        type: 'leaf', icon: 'Share2', visualType: 'social-icon',
        socialPlatform: platform, socialHandle: '@seuperfil', socialFollowers: '0',
        children: undefined,
      };
      const updatedRoot = addChildNode(currentMap.rootNode, currentMap.rootNode.id, newNode);
      setCurrentMap({ ...currentMap, rootNode: updatedRoot });
      setConnectionSourceAfterCreate(newId);
      toast.success('Ícone social adicionado', { description: 'Clique num potinho verde para conectar.' });
      return;
    }

    if (!trimmed) {
      const placeholder = getEmptyCardPlaceholder(visualType);
      const newNode: MapNode = {
        ...placeholder,
        id: newId,
        label: placeholder.label ?? 'Novo card',
        type: 'leaf',
        icon: placeholder.icon ?? 'FileText',
        visualType,
        children: undefined,
      } as MapNode;
      const updatedRoot = addChildNode(currentMap.rootNode, currentMap.rootNode.id, newNode);
      setCurrentMap({ ...currentMap, rootNode: updatedRoot });
      setConnectionSourceAfterCreate(newId);
      toast.success('Card adicionado', { description: 'Edite o conteúdo no mapa e clique em um potinho verde para conectar.' });
      return;
    }

    try {
      setCreatingCard(true);
      const draft = await generateCardNode(visualType, trimmed, planLevel);
      const baseLabel = draft.label ?? trimmed.slice(0, 60);
      const base: any = draft ?? {};
      const newNode: MapNode = {
        ...(base as Partial<MapNode>),
        id: newId,
        label: baseLabel,
        description: base.description,
        type: base.type ?? 'leaf',
        icon: base.icon ?? 'Sparkles',
        visualType,
        children: undefined,
      };
      const updatedRoot = addChildNode(currentMap.rootNode, currentMap.rootNode.id, newNode);
      setCurrentMap({ ...currentMap, rootNode: updatedRoot });
      setConnectionSourceAfterCreate(newId);
      toast.success('Card criado', { description: 'Clique em um potinho verde para conectar o card ao bloco desejado.' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Erro ao criar card', { description: msg });
    } finally {
      setCreatingCard(false);
    }
  }, [currentMap, addChildNode]);

  const hasMap = !!currentMap && !isLoading;

  const toastStyle = {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '13px', fontWeight: 300,
    borderRadius: '12px', fontFamily: 'var(--font-inter)',
    marginTop: '56px',
  };

  const showNoPlanModal = hasActivePlan === false;

  return (
    <SocialIconsProvider>
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)', position: 'relative' }}>
      {showNoPlanModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: '100%',
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 20,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={22} color="var(--color-muted)" strokeWidth={1.8} />
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>
              Você não tem um plano ativo
            </div>
            <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Para acessar a aplicação, ative um plano usando o mesmo e-mail com o qual você criou a conta:
            </p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', wordBreak: 'break-all', marginBottom: 24 }}>
              {user?.email}
            </p>
            <a
              href="/#pricing"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: 12,
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Ver planos
            </a>
          </div>
        </div>
      )}

    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)', flex: 1, pointerEvents: showNoPlanModal ? 'none' : 'auto', opacity: showNoPlanModal ? 0.5 : 1 }}>
      <Toaster position="top-right" toastOptions={{ style: toastStyle }} />

      <Sidebar
        generations={generations}
        onSelect={handleSelectGeneration}
        onDelete={handleDeleteGeneration}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header
          onToggleSidebar={() => setSidebarOpen(s => !s)}
          mapTitle={hasMap ? currentMap!.title : null}
          mapPrompt={hasMap ? currentPrompt : null}
          onNewMap={hasMap ? handleNewMap : undefined}
          onSaveMap={hasMap ? handleSaveMap : undefined}
          isSaving={isSaving}
          canShare={hasMap ? (planLevel === 'creator' || planLevel === 'pro') : undefined}
          isPublic={isPublic}
          shareToken={shareToken}
          onToggleShare={hasMap ? handleToggleShare : undefined}
        />

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: isDark
              ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
              : 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, rgba(0,0,0,0.5) 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, rgba(0,0,0,0.5) 88%, transparent 100%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <LoadingAnimation prompt={loadingPrompt} />
              </motion.div>

            ) : error ? (
              <motion.div
                key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 20, padding: 32, textAlign: 'center',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, border: '1px solid var(--color-border)', fontSize: 10, fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c44', flexShrink: 0 }} />
                  Erro
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>Algo deu errado</h3>
                <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--color-muted)', maxWidth: 360, lineHeight: 1.65 }}>{error}</p>
                <button
                  onClick={() => { setError(null); if (currentPrompt) handleGenerate(currentPrompt); }}
                  style={{ padding: '12px 28px', borderRadius: 100, border: 'none', background: 'var(--color-text)', color: 'var(--color-bg)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
                >
                  Tentar novamente
                </button>
              </motion.div>

            ) : hasMap ? (
              <motion.div key={`map-${currentPrompt}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <MapRenderer
                  mapData={currentMap!}
                  layoutMode={layoutMode}
                  connectionStyle={connectionStyle}
                  expandingNodeId={expandingNodeId}
                  onRequestExpandNode={handleExpandNode}
                  onReparentNode={handleReparentNode}
                  onReparentAnnotation={handleReparentAnnotation}
                  onDeleteAnnotation={handleDeleteAnnotation}
                  onCreateCard={handleCreateCard}
                  creatingCard={creatingCard}
                  userPlan={planLevel}
                  connectionSourceAfterCreate={connectionSourceAfterCreate}
                  onConsumeConnectionSourceAfterCreate={() => setConnectionSourceAfterCreate(null)}
                />
              </motion.div>

            ) : (
              <motion.div
                key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '48px 14px',
                }}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    fontSize: 'clamp(28px, 4.2vw, 52px)', fontWeight: 500,
                    letterSpacing: '-0.03em', lineHeight: 1.2,
                    color: 'var(--color-text)', marginBottom: 14, textAlign: 'center',
                  }}
                >
                  Crie Mapas Mentais
                  <br />
                  <em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 400, opacity: 0.72 }}>
                    Visuais
                  </em>{' '}
                  com IA
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  style={{
                    fontSize: 15, fontWeight: 300, lineHeight: 1.55,
                    color: 'var(--color-muted)', maxWidth: 380,
                    margin: '0 auto 24px', textAlign: 'center',
                  }}
                >
                  Digite um tema e a IA cria um mapa animado — ideal para aulas, YouTube e apresentações.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.14 }}
                  style={{ width: '100%', maxWidth: 650 }}
                >
                  <PromptInput onGenerate={handleGenerate} isLoading={isLoading} onCreateBlank={handleCreateBlank} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </div>
    </SocialIconsProvider>
  );
}
