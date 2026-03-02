'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Paperclip, X, MousePointer2, Type, ImageIcon, ListOrdered, ChevronDown, PenLine } from 'lucide-react';
import { LayoutMode, ConnectionStyle } from '@/lib/types';

const TYPING_PHRASES = [
  'Digite o tema do seu mapa mental...',
  'Ex: Estratégia de conteúdo para redes sociais',
  'Ex: Como funciona o algoritmo do TikTok',
  'Ex: Funil de vendas digital',
];

export interface AttachedFile {
  name: string;
  mimeType: string;
  base64: string;
  sizeKB: number;
}

export interface GenerateOptions {
  layoutMode: LayoutMode;
  connectionStyle: ConnectionStyle;
  attachment?: AttachedFile;
  /** IA adiciona textos extras (insights, anotações) no mapa */
  addExtraTexts?: boolean;
  /** IA adiciona imagens de referência (URLs públicas) */
  addReferenceImages?: boolean;
  /** Mapa com numeração: tópicos 1, 2, 3… na ordem de importância, funil organizado em sequência */
  addNumberedSequence?: boolean;
}

interface Props {
  onGenerate: (prompt: string, options: GenerateOptions) => void;
  isLoading: boolean;
  onCreateBlank?: () => void;
}

const EXAMPLES = [
  'Como o algoritmo do TikTok ranqueia e distribui vídeos no feed Para Você',
  'Funil de vendas digital completo: da atração ao fechamento',
  'Estratégia de marketing de conteúdo para geração de leads B2B',
  'SEO para iniciantes: fatores de ranqueamento e boas práticas',
  'Sinais de engajamento e métricas que importam nas redes sociais',
  'Como criar uma rotina de conteúdo que gera resultados',
];

const LAYOUTS: { id: LayoutMode; label: string; icon: string; tip: string }[] = [
  { id: 'top-down',   label: 'Vertical',   icon: '↓', tip: 'Raiz no topo, conteúdo expande para baixo (funil)' },
  { id: 'left-right', label: 'Horizontal', icon: '→', tip: 'Raiz à esquerda, conteúdo expande para a direita' },
  { id: 'tecnico',    label: 'Técnico',    icon: '◫', tip: 'Foco em texto: tópicos em conteúdo e, para cada card visual, uma explicação em texto abaixo dele' },
];

const CONNECTIONS: { id: ConnectionStyle; label: string; icon: string }[] = [
  { id: 'bezier',   label: 'Curvas',    icon: '~'  },
  { id: 'straight', label: 'Retas',     icon: '╱'  },
  { id: 'angular',  label: 'Angulares', icon: '⌐'  },
];

export function PromptInput({ onGenerate, isLoading, onCreateBlank }: Props) {
  const [prompt, setPrompt]             = useState('');
  const [isFocused, setIsFocused]      = useState(false);
  const [layout, setLayout]            = useState<LayoutMode>('top-down');
  const [connStyle, setConnStyle]      = useState<ConnectionStyle>('bezier');
  const [attachment, setAttachment]    = useState<AttachedFile | null>(null);
  const [fileError, setFileError]     = useState<string | null>(null);
  const [addExtraTexts, setAddExtraTexts] = useState(false);
  const [addReferenceImages, setAddReferenceImages] = useState(false);
  const [addNumberedSequence, setAddNumberedSequence] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [connOpen, setConnOpen] = useState(false);
  const [typingState, setTypingState] = useState<{ phraseIndex: number; length: number; phase: 'typing' | 'pause' | 'deleting' }>({
    phraseIndex: 0, length: 0, phase: 'typing',
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layoutDropdownRef = useRef<HTMLDivElement>(null);
  const connDropdownRef = useRef<HTMLDivElement>(null);

  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  // Efeito typewriter: cicla por TYPING_PHRASES quando o campo está vazio e sem foco
  useEffect(() => {
    if (prompt.length > 0 || isFocused) return;
    const { phraseIndex, length, phase } = typingState;
    const phrase = TYPING_PHRASES[phraseIndex] ?? '';
    const len = phrase.length;
    if (len === 0) return;

    if (phase === 'typing') {
      if (length < len) {
        const t = setTimeout(() => setTypingState((s) => ({ ...s, length: s.length + 1 })), 55);
        return () => clearTimeout(t);
      }
      if (length === len) {
        setTypingState((s) => ({ ...s, phase: 'pause' }));
        return;
      }
    }
    if (phase === 'pause') {
      const t = setTimeout(() => setTypingState((s) => ({ ...s, phase: 'deleting' })), 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'deleting') {
      if (length > 0) {
        const t = setTimeout(() => setTypingState((s) => ({ ...s, length: s.length - 1 })), 30);
        return () => clearTimeout(t);
      }
      setTypingState({
        phraseIndex: (phraseIndex + 1) % TYPING_PHRASES.length,
        length: 0,
        phase: 'typing',
      });
    }
  }, [typingState.phraseIndex, typingState.length, typingState.phase, prompt.length, isFocused]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (layoutOpen && layoutDropdownRef.current && !layoutDropdownRef.current.contains(e.target as Node)) setLayoutOpen(false);
      if (connOpen && connDropdownRef.current && !connDropdownRef.current.contains(e.target as Node)) setConnOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [layoutOpen, connOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    if (file.size > MAX_SIZE_BYTES) {
      setFileError('Arquivo muito grande. Máximo: 5 MB.');
      return;
    }
    const allowed = ['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|md|docx)$/i)) {
      setFileError('Formato inválido. Use PDF, TXT, MD ou DOCX.');
      return;
    }
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const base64 = btoa(binary);
    setAttachment({ name: file.name, mimeType: file.type || 'application/octet-stream', base64, sizeKB: Math.round(file.size / 1024) });
    if (e.target) e.target.value = '';
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const text = prompt.trim() || (attachment ? `Mapa a partir do documento: ${attachment.name}` : '');
    if (!text && !attachment) return;
    onGenerate(text, {
      layoutMode: layout,
      connectionStyle: connStyle,
      attachment: attachment ?? undefined,
      addExtraTexts,
      addReferenceImages,
      addNumberedSequence,
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = (!!prompt.trim() || !!attachment) && !isLoading;

  return (
    <div className="prompt-input-root" style={{ width: '100%', maxWidth: 650, margin: '0 auto', minWidth: 0, padding: '0 10px', boxSizing: 'border-box' }}>
      {/* Card do gerador */}
      <div style={{
        borderRadius: 'var(--radius)',
        border: `1px solid ${isFocused ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
        background: 'var(--color-card)',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
        boxShadow: isFocused
          ? '0 0 0 1px var(--color-border-hover), 0 8px 40px var(--color-glow)'
          : 'none',
        overflow: 'visible',
        minWidth: 0,
      }}>
        {/* Topo: Textarea */}
        <div style={{ padding: '20px 16px 18px', position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=" "
            rows={2}
            disabled={isLoading}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', fontFamily: 'var(--font-inter)', fontSize: 15,
              fontWeight: 300, lineHeight: 1.5, color: 'var(--color-text)',
              caretColor: 'var(--color-text)', boxSizing: 'border-box',
            }}
          />
          {!prompt.trim() && !isFocused && (
            <div
              aria-hidden
              className="prompt-placeholder-overlay"
              style={{
                position: 'absolute', left: 16, top: 20, right: 16, bottom: 18,
                pointerEvents: 'none', color: 'var(--color-muted)', fontSize: 15,
                fontWeight: 300, lineHeight: 1.5, fontFamily: 'var(--font-inter)',
                whiteSpace: 'pre-wrap', overflow: 'hidden',
              }}
            >
              {(TYPING_PHRASES[typingState.phraseIndex] ?? '').slice(0, typingState.length)}
              <span style={{ display: 'inline-block', width: 2, height: 18, background: 'var(--color-muted)', marginLeft: 1, animation: 'caret-blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
            </div>
          )}
        </div>

        {/* Opções: grid 3 colunas — col 1-2 Layout/Conexões, col 3 Incluir+ícones (alinhado à direita); depois linha cheia e Anexar | Ctrl+Gerar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto 1fr',
          alignItems: 'center',
          gap: '12px 16px',
          padding: '12px 16px 0',
          borderTop: '1px solid var(--color-border)',
          minWidth: 0,
        }}>
          {/* Col 1: Layout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Layout
            </span>
            <div ref={layoutDropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setLayoutOpen(o => !o)}
                title={LAYOUTS.find(l => l.id === layout)?.tip}
                style={{
                  position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 26px 5px 10px', borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                  color: 'var(--color-text)',
                  fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-inter)',
                  cursor: 'pointer', minWidth: 110,
                }}
              >
                {LAYOUTS.find(l => l.id === layout)?.icon} {LAYOUTS.find(l => l.id === layout)?.label}
                <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              </button>
              {layoutOpen && (
                <div
                  style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
                    minWidth: '100%', borderRadius: 12, border: '1px solid var(--color-border)',
                    background: 'var(--color-card)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    overflow: 'hidden',
                  }}
                >
                  {LAYOUTS.map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => { setLayout(l.id); setLayoutOpen(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', border: 'none', background: layout === l.id ? 'var(--color-border)' : 'transparent',
                        color: 'var(--color-text)', fontSize: 10.5, fontFamily: 'var(--font-inter)',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-border)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = layout === l.id ? 'var(--color-border)' : 'transparent'; }}
                    >
                      {l.icon} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conexões — dropdown customizado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Conexões
            </span>
            <div ref={connDropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setConnOpen(o => !o)}
                style={{
                  position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 26px 5px 10px', borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                  color: 'var(--color-text)',
                  fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-inter)',
                  cursor: 'pointer', minWidth: 110,
                }}
              >
                {CONNECTIONS.find(c => c.id === connStyle)?.icon} {CONNECTIONS.find(c => c.id === connStyle)?.label}
                <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              </button>
              {connOpen && (
                <div
                  style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
                    minWidth: '100%', borderRadius: 12, border: '1px solid var(--color-border)',
                    background: 'var(--color-card)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    overflow: 'hidden',
                  }}
                >
                  {CONNECTIONS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setConnStyle(c.id); setConnOpen(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', border: 'none', background: connStyle === c.id ? 'var(--color-border)' : 'transparent',
                        color: 'var(--color-text)', fontSize: 10.5, fontFamily: 'var(--font-inter)',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-border)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = connStyle === c.id ? 'var(--color-border)' : 'transparent'; }}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Incluir + ícones alinhados à direita (mesma coluna que Ctrl+Enter e Gerar Mapa) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', minWidth: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Incluir
            </span>
            <button
              type="button"
              onClick={() => setAddExtraTexts(t => !t)}
              title="Textos extras (insights, anotações)"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, padding: 0, borderRadius: 10,
                border: `1px solid ${addExtraTexts ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
                background: addExtraTexts ? 'var(--color-card-hover, rgba(255,255,255,0.06))' : 'transparent',
                color: addExtraTexts ? 'var(--color-text)' : 'var(--color-muted)',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              <Type size={16} />
            </button>
            <button
              type="button"
              onClick={() => setAddReferenceImages(i => !i)}
              title="Imagens de referência"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, padding: 0, borderRadius: 10,
                border: `1px solid ${addReferenceImages ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
                background: addReferenceImages ? 'var(--color-card-hover, rgba(255,255,255,0.06))' : 'transparent',
                color: addReferenceImages ? 'var(--color-text)' : 'var(--color-muted)',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              <ImageIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => setAddNumberedSequence(n => !n)}
              title="Numeração: organiza o mapa em sequência (Tópico 1, 2, 3…) do mais importante ao final"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, padding: 0, borderRadius: 10,
                border: `1px solid ${addNumberedSequence ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
                background: addNumberedSequence ? 'var(--color-card-hover, rgba(255,255,255,0.06))' : 'transparent',
                color: addNumberedSequence ? 'var(--color-text)' : 'var(--color-muted)',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              <ListOrdered size={16} />
            </button>
          </div>

          {/* Linha divisória — de ponta a ponta do card (igual à linha acima das opções) */}
          <div style={{
            gridColumn: '1 / -1',
            borderTop: '1px solid var(--color-border)',
            marginLeft: -16,
            marginRight: -16,
            width: 'calc(100% + 32px)',
          }} />

          {/* Última linha: Anexar à esquerda | Ctrl+Enter + Gerar Mapa à direita (mesma coluna que ícones) */}
          <div
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              paddingTop: 12,
              paddingBottom: 12,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
              {attachment ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, border: '1px solid var(--color-border)', background: 'var(--color-card-hover, rgba(255,255,255,0.04))' }}>
                  <Paperclip size={12} style={{ color: 'var(--color-text)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--color-text)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachment.name} <span style={{ opacity: 0.5 }}>({attachment.sizeKB}KB)</span>
                  </span>
                  <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', alignItems: 'center' }}>
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Anexar PDF, TXT ou DOCX (máx. 5 MB)"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 12, fontWeight: 400, cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
                >
                  <Paperclip size={12} />Anexar
                </button>
              )}
              {fileError && <span style={{ fontSize: 11, color: '#e05555', marginLeft: 6 }}>{fileError}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Ctrl+Enter
              </span>
              {/* Criar do Zero */}
              {onCreateBlank && !isLoading && (
                <motion.button
                  onClick={onCreateBlank}
                  whileHover={{ translateY: -1 }}
                  whileTap={{ scale: 0.97 }}
                  title="Abrir canvas em branco e montar o mapa arrastando cards"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 100,
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-muted)',
                    fontSize: 13, fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap',
                  } as React.CSSProperties}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
                >
                  <PenLine size={13} />
                  Criar do Zero
                </motion.button>
              )}
              {/* Gerar Mapa */}
              <motion.button
                onClick={handleSubmit}
                disabled={!canSubmit}
                whileHover={canSubmit ? { translateY: -1, opacity: 0.9 } : {}}
                whileTap={canSubmit ? { scale: 0.97 } : {}}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 100,
                  border: `1px solid ${canSubmit ? 'transparent' : 'var(--color-border)'}`,
                  background: canSubmit ? 'var(--color-text)' : 'var(--color-card)',
                  color: canSubmit ? 'var(--color-bg)' : 'var(--color-faint)',
                  fontSize: 13, fontWeight: 500,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'background var(--transition), color var(--transition)',
                  fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap',
                } as React.CSSProperties}
              >
                {isLoading ? (
                  <><Loader2 size={14} className="animate-spin" />Gerando...</>
                ) : (
                  <>Gerar Mapa<ArrowRight size={14} /></>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Exemplos — centralizado abaixo do gerador, em grid (não empilhados) */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 10 }}>
          Exemplos
        </span>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 10,
          width: '100%',
          maxWidth: 650,
        }}>
          {EXAMPLES.map(example => (
            <button
              key={example}
              onClick={() => { setPrompt(example); textareaRef.current?.focus(); }}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'transparent',
                fontSize: 13,
                fontWeight: 400,
                color: 'var(--color-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-inter)',
                textAlign: 'left',
                lineHeight: 1.4,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = 'var(--color-border-hover)';
                el.style.color = 'var(--color-text)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = 'var(--color-border)';
                el.style.color = 'var(--color-muted)';
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .prompt-input-root textarea { min-height: 2.6em !important; max-height: 5.2em !important; }
          .prompt-input-root .prompt-placeholder-overlay { -webkit-line-clamp: 2; line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; max-height: 3.9em; }
          .prompt-input-root button[title="Gerar Mapa"], .prompt-input-root a, .prompt-input-root [title="Criar do Zero"] { min-height: 44px; padding: 12px 18px !important; }
        }
      `}</style>
    </div>
  );
}
