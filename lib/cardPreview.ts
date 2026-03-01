import type { LayoutNode, MapNode, VisualType } from './types';
import { getCardSize } from './mapLayout';

/** Icone e estrutura minima por tipo, para card adicionado sem IA (editar no mapa). */
export function getEmptyCardPlaceholder(visualType: VisualType): Partial<MapNode> {
  const label = 'Novo card';
  switch (visualType) {
    case 'default':       return { label, icon: 'FileText' };
    case 'stat':          return { label, icon: 'Percent', statValue: '--', statLabel: '' };
    case 'chart-bar':     return { label, icon: 'BarChart3', bars: [{ label: 'Item 1', value: 0 }, { label: 'Item 2', value: 0 }] };
    case 'chart-ring':    return { label, icon: 'Target', ringValue: 0, ringLabel: '' };
    case 'timeline':      return { label, icon: 'ListOrdered', steps: [{ label: 'Passo 1', desc: '' }, { label: 'Passo 2', desc: '' }] };
    case 'comparison':    return { label, icon: 'Scale', compLeft: { label: 'A', value: '' }, compRight: { label: 'B', value: '' } };
    case 'highlight':     return { label, icon: 'Lightbulb', quote: '...' };
    case 'list':          return { label, icon: 'List', listItems: [{ text: 'Item 1' }, { text: 'Item 2' }] };
    case 'line-chart':    return { label, icon: 'TrendingUp', lineChartPoints: [{ label: '', value: 0 }, { label: '', value: 0 }], lineChartLabel: '' };
    case 'progress-bars': return { label, icon: 'Activity', progressBars: [{ label: '', value: 0, max: 100 }, { label: '', value: 0, max: 100 }] };
    case 'progress-ring': return { label, icon: 'Loader2', progressRingValue: 0, progressRingMax: 1, progressRingLabel: '' };
    case 'countdown':     return { label, icon: 'Timer', countdownValue: '--', countdownLabel: '' };
    case 'balance':       return { label, icon: 'Wallet', balanceLabel: 'Saldo', balanceValue: '--' };
    case 'summary':       return { label, icon: 'FileCheck', summaryItems: [{ label: '', value: '' }] };
    case 'checklist':     return { label, icon: 'CheckSquare', checklistItems: [{ text: 'Item 1', done: false }, { text: 'Item 2', done: false }] };
    case 'success':       return { label, icon: 'CheckCircle', successTitle: '', successMessage: '' };
    case 'product-row':   return { label, icon: 'Package', productTitle: '', productSubtitle: '', productPrice: '' };
    case 'rating':        return { label, icon: 'Star', ratingValue: '--', ratingMax: 5, ratingLabel: 'Nota' };
    case 'date-pills':    return { label, icon: 'Calendar', datePills: [{ label: '', date: '', selected: false }] };
    case 'time-slots':    return { label, icon: 'Clock', timeSlots: [{ time: '', selected: false }] };
    // Premium
    case 'feature-card':      return { label: 'Funcionalidade', icon: 'Sparkles', featureIcon: 'Zap', featureBadge: 'Novo', featureDesc: 'Descreva o beneficio principal desta funcionalidade aqui.' };
    case 'gradient-stat':     return { label: 'Receita Mensal', icon: 'TrendingUp', statValue: 'R$48k', statLabel: 'receita recorrente', statTrend: '+18%' };
    case 'icon-grid':         return { label: 'Funcionalidades', icon: 'LayoutGrid', iconGrid: [{ icon: 'Zap', label: 'Velocidade' }, { icon: 'Shield', label: 'Seguranca' }, { icon: 'Globe', label: 'Global' }, { icon: 'Rocket', label: 'Escala' }, { icon: 'Brain', label: 'IA' }, { icon: 'Heart', label: 'UX' }] };
    case 'flow-steps':        return { label: 'Processo', icon: 'ArrowRight', flowSteps: [{ label: 'Planejar', icon: 'Target' }, { label: 'Executar', icon: 'Zap' }, { label: 'Medir', icon: 'BarChart2' }, { label: 'Otimizar', icon: 'TrendingUp' }] };
    case 'testimonial':       return { label: 'Depoimento', icon: 'MessageCircle', testimonialText: 'Adicione aqui o depoimento do cliente. Quanto mais especifico, maior a credibilidade.', testimonialAuthor: 'Nome do Cliente', testimonialRole: 'Cargo, Empresa' };
    case 'price-tag':         return { label: 'Plano Pro', icon: 'Tag', priceName: 'Pro', priceAmount: 'R$97', pricePeriod: '/mes', priceFeatures: ['Acesso completo', 'Suporte prioritario', 'Atualizacoes gratuitas'] };
    case 'alert-box':         return { label: 'Aviso', icon: 'AlertCircle', alertType: 'warning', alertTitle: 'Atencao importante', alertMessage: 'Descreva aqui a mensagem de alerta ou aviso para o usuario.' };
    case 'metric-trio':       return { label: 'Resultados', icon: 'BarChart2', metricItems: [{ value: '2.4k', label: 'Leads', trend: '+12%' }, { value: '18%', label: 'Conversao', trend: '+3%' }, { value: 'R$94k', label: 'Receita', trend: '+28%' }] };
    case 'kanban-card':       return { label: 'Sprint Atual', icon: 'Columns', kanbanStatus: 'Em Progresso', kanbanItems: [{ text: 'Design do layout', done: true }, { text: 'Integracao API', done: false }, { text: 'Testes finais', done: false }] };
    case 'tag-cloud':         return { label: 'Temas', icon: 'Hash', tags: [{ label: 'Marketing', size: 'lg' }, { label: 'Vendas', size: 'lg' }, { label: 'SEO', size: 'md' }, { label: 'Copy', size: 'md' }, { label: 'Funil', size: 'sm' }, { label: 'Email', size: 'sm' }, { label: 'Trafego', size: 'md' }] };
    case 'versus-card':       return { label: 'Comparativo', icon: 'Scale', versusLeft: { label: 'Antes', score: 32 }, versusRight: { label: 'Depois', score: 87 }, versusWinner: 'right' };
    case 'steps-numbered':    return { label: 'Plano de Acao', icon: 'ListOrdered', numberedSteps: [{ title: 'Definir objetivo', desc: 'Estabeleca metas claras e mensuraveis' }, { title: 'Criar estrategia', desc: 'Mapeie o caminho para o resultado' }, { title: 'Executar e medir', desc: 'Implemente e acompanhe os resultados' }] };
    case 'social-stat':       return { label: 'Seguidores', icon: 'Users', socialValue: '148k', socialPlatform: 'Instagram', socialGrowth: '+2.3k' };
    case 'cta-card':          return { label: 'Proximo passo', icon: 'Megaphone', ctaTitle: 'Pronto para comecar?', ctaDesc: 'Crie seu primeiro mapa visual em menos de 2 minutos.', ctaAction: 'Comecar agora' };
    case 'score-card':        return { label: 'NPS Score', icon: 'Award', scoreValue: '9.2', scoreLabel: 'Excelente', scoreSub: 'Baseado em 342 respostas' };
    case 'heatmap':           return { label: 'Atividade Semanal', icon: 'Activity', heatmapLabel: 'Commits por dia', heatmapPeak: 'Sexta' };
    case 'avatar-list':       return { label: 'Time', icon: 'Users', avatarItems: [{ name: 'Ana Lima', role: 'Product Manager' }, { name: 'Bruno Santos', role: 'Designer UX' }, { name: 'Carla Melo', role: 'Engenheira' }] };
    case 'notification-card': return { label: 'Notificacao', icon: 'Bell', notifTitle: 'Nova venda realizada', notifMessage: 'Pedro Alves adquiriu o Plano Pro. Receita +R$97', notifTime: 'agora', notifType: 'success' };
    case 'insight-numbered':  return { label: 'Insights Chave', icon: 'Lightbulb', insights: [{ num: '01', text: '73% dos usuarios abandonam em 3 passos' }, { num: '02', text: 'Urgencia aumenta 40% a conversao' }, { num: '03', text: 'Prova social reduz objecoes em 60%' }] };
    case 'skill-grid':        return { label: 'Competencias', icon: 'Sliders', skills: [{ label: 'Copywriting', level: 5 }, { label: 'Design', level: 3 }, { label: 'Trafego Pago', level: 4 }, { label: 'Video', level: 2 }] };
    case 'quote-hero':        return { label: 'Citacao', icon: 'Quote', quote: 'A simplicidade e a sofisticacao maxima. Edite esta citacao clicando duas vezes.', quoteAuthor: 'Autor da Citacao' };
    case 'compare-table':     return { label: 'Comparativo de Planos', icon: 'Table2', compareLabels: ['Pro', 'Basico'], compareItems: [{ feature: 'Mapas', a: 'Ilimitado', b: '5/mes' }, { feature: 'Exportar PDF', a: true, b: false }, { feature: 'Suporte', a: 'Prioritario', b: 'Email' }, { feature: 'Blocos', a: '50 tipos', b: '20 tipos' }] };
    case 'cycle-flow':        return { label: 'Ciclo de Crescimento', icon: 'RefreshCw', cycleSteps: [{ label: 'Atrair', icon: 'Magnet' }, { label: 'Engajar', icon: 'MessageCircle' }, { label: 'Converter', icon: 'DollarSign' }, { label: 'Reter', icon: 'Heart' }] };
    case 'funnel-bars':       return { label: 'Funil de Conversão', icon: 'Filter', funnelSteps: [{ label: 'Visitantes', value: 10000 }, { label: 'Leads', value: 2400 }, { label: 'Oportunidades', value: 800 }, { label: 'Propostas', value: 320 }, { label: 'Clientes', value: 128 }] };
    case 'priority-board':    return { label: 'Backlog Priorizado', icon: 'Flag', priorityItems: [{ text: 'Corrigir bug critico', priority: 'high' }, { text: 'Melhorar performance', priority: 'medium' }, { text: 'Atualizar documentacao', priority: 'low' }] };
    case 'event-card':        return { label: 'Proximo Evento', icon: 'Calendar', eventTitle: 'Workshop de Estrategia', eventDate: '15 MAR', eventTime: '19:00 - 21:00', eventLocation: 'Online via Zoom' };
    case 'growth-indicator':  return { label: 'Crescimento', icon: 'TrendingUp', growthValue: '+147%', growthLabel: 'faturamento anual', growthPoints: [12, 18, 15, 28, 22, 40, 38, 62, 55, 88, 82, 110] };
    case 'team-card':         return { label: 'Perfil', icon: 'User', teamName: 'Rafael Costa', teamRole: 'Head de Marketing', teamStats: [{ label: 'Campanhas', value: '48' }, { label: 'ROAS', value: '4.2x' }, { label: 'Leads/mes', value: '1.2k' }] };
    case 'pill-metrics':      return { label: 'Indicadores', icon: 'Circle', pillItems: [{ label: 'CPL', value: 'R$8,40', icon: 'DollarSign' }, { label: 'CTR', value: '3.2%', icon: 'MousePointer' }, { label: 'ROAS', value: '4.8x', icon: 'TrendingUp' }, { label: 'CPC', value: 'R$1,20', icon: 'Coins' }] };
    case 'code-snippet':      return { label: 'Exemplo de Codigo', icon: 'Code2', codeLang: 'typescript', codeLines: ['const mapa = await ia.gerar({', '  tema: "meu conteudo",', '  blocos: 50,', '});', 'console.log(mapa);'] };
    case 'social-icon':       return { label: 'Instagram', icon: 'Share2', socialPlatform: 'instagram', socialHandle: '@seuperfil', socialFollowers: '10k' };
    default:                  return { label, icon: 'FileText' };
  }
}

/**
 * Retorna um LayoutNode de exemplo para o painel de preview,
 * com dados reais para cada visualType.
 */
export function getPreviewLayoutNode(visualType: VisualType): LayoutNode {
  const base: LayoutNode = {
    id: 'preview',
    label: 'Titulo do card',
    type: 'leaf',
    icon: 'Sparkles',
    visualType,
    x: 0,
    y: 0,
    depth: 0,
    parentId: undefined,
    ...getCardSize({ type: 'leaf', visualType } as LayoutNode),
  };

  switch (visualType) {
    case 'default':
      return { ...base, icon: 'FileText', description: 'Descricao do card.' };

    case 'stat':
      return { ...base, icon: 'Percent', label: 'Taxa de Replay', statValue: '72%', statLabel: 'replay medio', statTrend: '+3%' };

    case 'chart-bar':
      return { ...base, icon: 'BarChart3', label: 'Grafico barras', bars: [{ label: 'Item A', value: 60 }, { label: 'Item B', value: 40 }, { label: 'Item C', value: 80 }] };

    case 'chart-ring':
      return { ...base, icon: 'Target', label: 'Grafico anel', ringValue: 75, ringLabel: 'concluido' };

    case 'timeline':
      return { ...base, icon: 'ListOrdered', label: 'Timeline', steps: [{ label: 'Etapa 1', desc: 'Inicio' }, { label: 'Etapa 2', desc: 'Desenvolvimento' }, { label: 'Etapa 3', desc: 'Conclusao' }] };

    case 'comparison':
      return { ...base, icon: 'Scale', label: 'Comparacao', compLeft: { label: 'Antes', value: '100' }, compRight: { label: 'Depois', value: '150' } };

    case 'highlight':
      return { ...base, icon: 'Lightbulb', label: 'Insight', quote: 'Destaque ou citacao do card.' };

    case 'list':
      return { ...base, icon: 'List', label: 'Lista', listItems: [{ icon: 'Check', text: 'Item concluido' }, { icon: 'Circle', text: 'Item pendente' }] };

    case 'line-chart':
      return { ...base, icon: 'TrendingUp', label: 'Idade Media', lineChartPoints: [{ label: '2019', value: 22 }, { label: '2020', value: 24 }, { label: '2021', value: 26 }, { label: '2022', value: 27 }, { label: '2023', value: 28 }, { label: '2024', value: 30 }], lineChartLabel: 'anos' };

    case 'progress-bars':
      return { ...base, icon: 'Activity', label: 'Progresso', progressBars: [{ label: 'Meta 1', value: 70, max: 100 }, { label: 'Meta 2', value: 40, max: 100 }] };

    case 'progress-ring':
      return { ...base, icon: 'Loader2', label: 'Progresso anel', progressRingValue: 6, progressRingMax: 7, progressRingLabel: 'dias' };

    case 'countdown':
      return { ...base, icon: 'Timer', label: 'Countdown', countdownValue: '2d 14h 30m', countdownLabel: 'para o lancamento' };

    case 'balance':
      return { ...base, icon: 'Wallet', label: 'Saldo', balanceValue: 'R$ 1.250', balanceLabel: 'disponivel' };

    case 'summary':
      return { ...base, icon: 'FileCheck', label: 'Resumo', summaryItems: [{ label: 'Ponto 1', value: 'Valor' }, { label: 'Ponto 2', value: 'Valor' }] };

    case 'checklist':
      return { ...base, icon: 'CheckSquare', label: 'Checklist', checklistItems: [{ text: 'Item concluido', done: true }, { text: 'Item pendente', done: false }] };

    case 'success':
      return { ...base, icon: 'CheckCircle', label: 'Sucesso', successTitle: 'Concluido', successMessage: 'Operacao finalizada com sucesso.' };

    case 'product-row':
      return { ...base, icon: 'Package', productTitle: 'Produto', productSubtitle: 'Descricao', productPrice: 'R$ 99', productCta: 'Comprar' };

    case 'rating':
      return { ...base, icon: 'Star', label: 'Avaliacao', ratingValue: '4.5', ratingMax: 5, ratingLabel: 'Satisfacao', ratingSubtext: 'baseado em 120 avaliacoes' };

    case 'date-pills':
      return { ...base, icon: 'Calendar', label: 'Dias', datePills: [{ label: 'Seg', date: '19', selected: true }, { label: 'Ter', date: '20', selected: false }, { label: 'Qua', date: '21', selected: false }] };

    case 'time-slots':
      return { ...base, icon: 'Clock', label: 'Horarios', timeSlots: [{ time: '09:00', selected: true }, { time: '14:00', selected: false }, { time: '20:00', selected: false }] };

    // ── Premium types ─────────────────────────────────────────────────────────
    case 'feature-card':
      return { ...base, icon: 'Zap', label: 'Geracao com IA', featureIcon: 'Sparkles', featureBadge: 'Novo', featureDesc: 'Crie mapas mentais visuais incriveis automaticamente com inteligencia artificial.' };

    case 'gradient-stat':
      return { ...base, icon: 'TrendingUp', label: 'Receita Mensal', statValue: 'R$48k', statLabel: 'receita recorrente', statTrend: '+18%' };

    case 'icon-grid':
      return { ...base, icon: 'LayoutGrid', label: 'Funcionalidades', iconGrid: [{ icon: 'Zap', label: 'Velocidade' }, { icon: 'Shield', label: 'Seguranca' }, { icon: 'Globe', label: 'Global' }, { icon: 'Rocket', label: 'Escala' }, { icon: 'Brain', label: 'IA' }, { icon: 'Heart', label: 'UX' }] };

    case 'flow-steps':
      return { ...base, icon: 'ArrowRight', label: 'Processo de Vendas', flowSteps: [{ label: 'Atrair', icon: 'Magnet' }, { label: 'Engajar', icon: 'Heart' }, { label: 'Converter', icon: 'DollarSign' }, { label: 'Fidelizar', icon: 'Star' }] };

    case 'testimonial':
      return { ...base, icon: 'MessageCircle', label: 'Depoimento', testimonialText: 'Aumentei minha receita em 3x em apenas 2 meses usando essa estrategia. Recomendo a todos!', testimonialAuthor: 'Carlos Mendes', testimonialRole: 'Fundador, TechStartup' };

    case 'price-tag':
      return { ...base, icon: 'Tag', label: 'Plano Creator', priceName: 'Creator', priceAmount: 'R$47', pricePeriod: '/mes', priceFeatures: ['10 mapas/mes', 'Blocos premium', 'Suporte prioritario'] };

    case 'alert-box':
      return { ...base, icon: 'AlertCircle', label: 'Atencao', alertType: 'warning', alertTitle: 'Prazo se encerrando', alertMessage: 'Voce tem apenas 2 dias para concluir esta etapa do projeto.' };

    case 'metric-trio':
      return { ...base, icon: 'BarChart2', label: 'Resultados do Mes', metricItems: [{ value: '2.4k', label: 'Leads', trend: '+12%' }, { value: '18%', label: 'Conversao', trend: '+3%' }, { value: 'R$94k', label: 'Receita', trend: '+28%' }] };

    case 'kanban-card':
      return { ...base, icon: 'Columns', label: 'Sprint Atual', kanbanStatus: 'Em Progresso', kanbanItems: [{ text: 'Design do dashboard', done: true }, { text: 'Integracao API', done: false }, { text: 'Testes unitarios', done: false }] };

    case 'tag-cloud':
      return { ...base, icon: 'Hash', label: 'Temas Principais', tags: [{ label: 'Marketing', size: 'lg' }, { label: 'Vendas', size: 'lg' }, { label: 'SEO', size: 'md' }, { label: 'Copywriting', size: 'md' }, { label: 'Trafego', size: 'sm' }, { label: 'Email', size: 'sm' }, { label: 'Funil', size: 'md' }] };

    case 'versus-card':
      return { ...base, icon: 'Scale', label: 'Comparativo', versusLeft: { label: 'Antes', score: 32 }, versusRight: { label: 'Depois', score: 87 }, versusWinner: 'right' };

    case 'steps-numbered':
      return { ...base, icon: 'ListOrdered', label: 'Plano de Acao', numberedSteps: [{ title: 'Definir objetivo', desc: 'Estabeleca metas claras e mensuraveis' }, { title: 'Criar estrategia', desc: 'Mapeie o caminho para o resultado' }, { title: 'Executar', desc: 'Implemente as acoes planejadas' }] };

    case 'social-stat':
      return { ...base, icon: 'Users', label: 'Seguidores Instagram', socialValue: '148k', socialPlatform: 'Instagram', socialGrowth: '+2.3k' };

    case 'cta-card':
      return { ...base, icon: 'Megaphone', label: 'Proximo passo', ctaTitle: 'Pronto para comecar?', ctaDesc: 'Crie seu primeiro mapa visual em menos de 2 minutos.', ctaAction: 'Comecar agora' };

    case 'score-card':
      return { ...base, icon: 'Award', label: 'NPS Score', scoreValue: '9.2', scoreLabel: 'Excelente', scoreSub: 'Baseado em 342 respostas' };

    case 'heatmap':
      return { ...base, icon: 'Activity', label: 'Atividade Semanal', heatmapLabel: 'Commits por dia', heatmapPeak: 'Sexta' };

    case 'avatar-list':
      return { ...base, icon: 'Users', label: 'Time de Produto', avatarItems: [{ name: 'Ana Lima', role: 'Product Manager' }, { name: 'Bruno Santos', role: 'Designer UX' }, { name: 'Carla Melo', role: 'Engenheira' }] };

    case 'notification-card':
      return { ...base, icon: 'Bell', label: 'Notificacao', notifTitle: 'Nova venda realizada', notifMessage: 'Pedro Alves adquiriu o Plano Pro. Receita +R$97', notifTime: '2 min', notifType: 'success' };

    case 'insight-numbered':
      return { ...base, icon: 'Lightbulb', label: 'Insights Chave', insights: [{ num: '01', text: '73% dos usuarios abandonam em 3 passos' }, { num: '02', text: 'Gatilho de urgencia aumenta 40% a conversao' }, { num: '03', text: 'Prova social reduz objecoes em 60%' }] };

    case 'skill-grid':
      return { ...base, icon: 'Sliders', label: 'Competencias', skills: [{ label: 'Copywriting', level: 5 }, { label: 'Design', level: 3 }, { label: 'Trafego Pago', level: 4 }, { label: 'Video', level: 2 }] };

    case 'quote-hero':
      return { ...base, icon: 'Quote', label: 'Citacao', quote: 'A simplicidade e a sofisticacao maxima.', quoteAuthor: 'Leonardo da Vinci' };

    case 'compare-table':
      return { ...base, icon: 'Table2', label: 'Comparativo de Planos', compareLabels: ['Pro', 'Basico'], compareItems: [{ feature: 'Mapas', a: 'Ilimitado', b: '5/mes' }, { feature: 'PDF Export', a: true, b: false }, { feature: 'Suporte', a: 'Prioritario', b: 'Email' }] };

    case 'cycle-flow':
      return { ...base, icon: 'RefreshCw', label: 'Ciclo de Crescimento', cycleSteps: [{ label: 'Atrair', icon: 'Magnet' }, { label: 'Engajar', icon: 'MessageCircle' }, { label: 'Converter', icon: 'DollarSign' }, { label: 'Reter', icon: 'Heart' }] };

    case 'funnel-bars':
      return { ...base, icon: 'Filter', label: 'Funil de Conversão', funnelSteps: [{ label: 'Visitantes', value: 10000 }, { label: 'Leads', value: 2400 }, { label: 'Oportunidades', value: 800 }, { label: 'Propostas', value: 320 }, { label: 'Clientes', value: 128 }] };

    case 'priority-board':
      return { ...base, icon: 'Flag', label: 'Backlog Priorizado', priorityItems: [{ text: 'Corrigir bug critico de login', priority: 'high' }, { text: 'Melhorar performance', priority: 'medium' }, { text: 'Atualizar documentacao', priority: 'low' }] };

    case 'event-card':
      return { ...base, icon: 'Calendar', label: 'Proximo Evento', eventTitle: 'Workshop de Copywriting', eventDate: '15 MAR', eventTime: '19:00 - 21:00', eventLocation: 'Online via Zoom' };

    case 'growth-indicator':
      return { ...base, icon: 'TrendingUp', label: 'Crescimento', growthValue: '+147%', growthLabel: 'faturamento anual', growthPoints: [12, 18, 15, 28, 22, 40, 38, 62, 55, 88, 82, 110] };

    case 'team-card':
      return { ...base, icon: 'User', label: 'Perfil', teamName: 'Rafael Costa', teamRole: 'Head de Marketing', teamStats: [{ label: 'Campanhas', value: '48' }, { label: 'ROAS medio', value: '4.2x' }, { label: 'Leads/mes', value: '1.2k' }] };

    case 'pill-metrics':
      return { ...base, icon: 'Circle', label: 'Indicadores', pillItems: [{ label: 'CPL', value: 'R$8,40', icon: 'DollarSign' }, { label: 'CTR', value: '3.2%', icon: 'MousePointer' }, { label: 'ROAS', value: '4.8x', icon: 'TrendingUp' }, { label: 'CPC', value: 'R$1,20', icon: 'Coins' }] };

    case 'code-snippet':
      return { ...base, icon: 'Code2', label: 'Exemplo de Codigo', codeLang: 'typescript', codeLines: ['const resultado = await ia.gerar({', '  tema: "marketing digital",', '  blocos: 50,', '  plano: "pro"', '});', 'console.log(resultado.mapa);'] };

    default:
      return base;
  }
}
