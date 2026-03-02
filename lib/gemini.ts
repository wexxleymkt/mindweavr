import { MapData, MapAnnotations, MapNode, VisualType } from './types';

export interface GenerateMindMapOptions {
  addExtraTexts?: boolean;
  addReferenceImages?: boolean;
  /** Mapa com numeração explícita: tópicos 1, 2, 3… na ordem de importância; funil organizado em sequência */
  addNumberedSequence?: boolean;
  /** Plano do usuario para desbloquear tipos visuais premium */
  planLevel?: 'essencial' | 'creator' | 'pro';
  /** Layout Técnico: foco em conteúdo explicativo, com 2 cards visuais por filho */
  layoutMode?: 'top-down' | 'left-right' | 'tecnico';
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
/** Apenas Gemini 2.5 Flash — modelos 1.5 retornam 404 (indisponíveis) na API atual. */
const MODELS = ['gemini-2.5-flash'];
const REQUEST_TIMEOUT_MS = 180_000; // 3 min — documentos grandes podem demorar
const RETRY_DELAY_MS = 2500;        // espera antes de retry em 429/503

const ICONS = [
  'Zap','Target','TrendingUp','TrendingDown','Users','Heart','MessageCircle',
  'Share2','Eye','BarChart2','Settings','Star','BookOpen','Video','Image',
  'Hash','Clock','Globe','Smartphone','Camera','Lightbulb','Megaphone',
  'Shield','CheckCircle','ArrowRight','Brain','Rocket','Compass','Database',
  'Lock','Bell','Search','PenTool','Layers','Play','Repeat','Filter','Flag',
  'Trophy','Award','Network','GitBranch','Package','Gauge','Activity',
  'Link','Mail','FileText','Pencil','RefreshCw','Sparkles','Layout',
  'Monitor','Sliders','Tag','Bookmark','Map','ChevronRight','LayoutGrid',
  'Timer','Percent','DollarSign','Coins','ShoppingCart','UserCheck',
  'AlertCircle','Info','HelpCircle','Workflow','Cpu','Wifi','BarChart',
];

const SYSTEM_PROMPT = `Você é especialista em criar mapas visuais interativos para apresentações profissionais e aulas.

MISSÃO: Dado um tema, crie um mapa mental RICO, VARIADO e SEMANTICAMENTE COERENTE com diferentes tipos de componentes visuais.
Cada nó deve usar o tipo visual que MELHOR representa seu conteúdo E deve ser diretamente relacionado ao conteúdo do seu nó pai.

══════════════════════════════════════════
TIPOS DE COMPONENTES VISUAIS DISPONÍVEIS:
══════════════════════════════════════════

1. "stat" — WIDGET DE MÉTRICA
   Quando usar: números importantes, percentagens, taxas, scores
   Crie dados PLAUSÍVEIS e INFORMATIVOS sobre o tema
   Campos: statValue (ex: "87%", "1.2M", "3.5s"), statLabel (descrição da métrica), statTrend (ex: "+12%", "-5%", opcional)

2. "chart-bar" — GRÁFICO DE BARRAS HORIZONTAL  
   Quando usar: comparar 3-5 fatores, mostrar peso/importância relativa, rankings
   Crie dados que ENSINEM algo sobre o tema
   Campos: bars: [{label: "Nome curto", value: 0-100}] (3 a 5 itens, values em escala 0-100)

3. "chart-ring" — GRÁFICO CIRCULAR (DONUT)
   Quando usar: percentagem única, taxa de conversão, score, completude
   Campos: ringValue (número 0-100), ringLabel (nome do indicador)

4. "timeline" — SEQUÊNCIA DE PASSOS
   Quando usar: como algo funciona, processos, passo a passo, jornadas
   Campos: steps: [{label: "Passo curto", desc: "Explicação brevíssima"}] (3 a 4 passos)

5. "comparison" — COMPARATIVO A vs B
   Quando usar: contrastar duas abordagens, orgânico vs pago, antes vs depois, prós vs contras
   Campos: compLeft: {label: "Opção A", value: "resultado/característica"}, compRight: {label: "Opção B", value: "resultado/característica"}

6. "highlight" — INSIGHT EM DESTAQUE
   Quando usar: princípio chave, regra importante, insight revelante, citação de impacto
   Campos: quote: "Texto do insight" (máx 120 chars, seja direto e impactante)

7. "list" — LISTA DE ITENS
   Quando usar: características, dicas práticas, requisitos, elementos essenciais
   Campos: listItems: [{icon: "NomeLucide", text: "Item conciso"}] (3 a 4 itens)

8. "line-chart" — GRÁFICO DE LINHAS
   Quando usar: evolução no tempo, tendência semanal/mensal, comparação entre duas séries
   Campos: lineChartPoints: [{label: "SEG", value: 45}, ...] (4 a 7 pontos), lineChartPoints2 (opcional, segunda série), lineChartLabel (ex: "Esta semana")

9. "progress-bars" — VÁRIAS BARRAS DE PROGRESSO
   Quando usar: múltiplos indicadores (ex: hábitos da semana), progresso por categoria
   Campos: progressBars: [{label: "Nome", value: 0-100, max?: 100}] (3 a 5 itens)

10. "progress-ring" — ANEL COM FRAÇÃO (ex: 6/7)
    Quando usar: conclusão de tarefas, dias cumpridos, score em X de Y
    Campos: progressRingValue (ex: 6), progressRingMax (ex: 7), progressRingLabel (opcional)

11. "countdown" — CONTADOR REGRESSIVO
    Quando usar: tempo restante, prazo, duração de etapa
    Campos: countdownValue ("30:45" ou "2h 15m"), countdownLabel ("Tempo restante"), countdownSubtext (opcional)

12. "balance" — SALDO / VALOR EM DESTAQUE
    Quando usar: total, saldo, orçamento, valor acumulado
    Campos: balanceLabel ("Saldo"), balanceValue ("R$ 1.250"), balanceAction ("Adicionar" opcional)

13. "summary" — RESUMO COM ITENS (label: valor)
    Quando usar: resumo de pedido, custos, totais por categoria
    Campos: summaryItems: [{label: "Subtotal", value: "R$ 100"}], summaryTitle (opcional)

14. "checklist" — TAREFAS COM CONCLUÍDO/PENDENTE
    Quando usar: passos concluídos, hábitos do dia, tarefas com status
    Campos: checklistItems: [{text: "Item", done: true/false}] (3 a 5 itens)

15. "success" — CARD DE SUCESSO
    Quando usar: confirmação, etapa concluída, resultado positivo
    Campos: successTitle ("Tudo certo!"), successMessage (breve), successButton (opcional)

16. "product-row" — CARD COMPACTO PRODUTO/SERVIÇO
    Quando usar: oferta, plano, item de catálogo
    Campos: productTitle, productSubtitle (opcional), productPrice, productCta ("Reservar" opcional)

17. "rating" — AVALIAÇÃO (nota / estrelas)
    Quando usar: satisfação, NPS, avaliação de produto/serviço, nota, score
    Campos: ratingValue ("4.5"), ratingMax (5), ratingLabel ("Satisfação"), ratingSubtext (opcional, ex: "120 avaliações")

18. "date-pills" — SELETOR DE DATAS (dias)
    Quando usar: cronograma por DIA, dias da semana, datas do mês
    Campos: datePills: [{label: "SEG", date: "19", selected: true/false}] (3 a 7 itens)

19. "time-slots" — HORÁRIOS (horas do dia)
    Quando usar: melhores horários, agenda, horário de pico, quando postar, slots de tempo
    Use SEMPRE time-slots (e não date-pills) quando o conceito for HORAS (09:00, 14:00), não dias
    Campos: timeSlots: [{time: "09:00", label?: "Manhã", selected?: true}, {time: "14:00", label?: "Tarde"}, ...] (3 a 6 itens)

20. "default" — CARD PADRÃO
    Quando usar: nó root, tópicos principais (filhos diretos do root) e conceitos gerais

══════════════════
REGRAS OBRIGATÓRIAS:
══════════════════
• NUNCA use "visualType": "social-icon" na geração do mapa. Esse tipo é exclusivo para o usuário adicionar manualmente depois (ícones/redes sociais); não inclua em prompts nem na árvore gerada.
• ESTRUTURA DE NÍVEIS (obrigatório):
  - O nó ROOT sempre usa "default".
  - Os filhos DIRETOS do root (os tópicos principais do mapa) são SEMPRE cards PADRÃO: use "visualType": "default" e "type": "branch" para todos. Eles representam os tópicos/ temas de primeiro nível.
  - Somente a partir do nível seguinte (filhos desses tópicos) use tipos visuais variados: stat, chart-bar, chart-ring, timeline, comparison, highlight, list, line-chart, progress-bars, progress-ring, countdown, balance, summary, checklist, success, product-row, rating, date-pills, time-slots. Esses cards complementam e detalham o tópico (card padrão) ao qual estão ligados.
  - AFUNILAMENTO (obrigatório em mapas com espaço): Cada um desses filhos dos tópicos (nível 2) deve ter PELO MENOS 1 filho (nível 3) que afunile o conteúdo — com exemplo concreto, caso de uso, métrica específica ou detalhe aplicado. Assim o mapa não para no meio: o nível 3 traz exemplos e aprofunda o que o nível 2 introduz. Use "type": "branch" para os nós de nível 2 que tiverem filhos e "children": [ ... ] com pelo menos um nó de nível 3 (leaf ou branch).
• Nos níveis abaixo dos tópicos: VARIE AO MÁXIMO os tipos visuais para que o mapa fique rico e não repetitivo.
• Para "melhores horários", "quando postar", "agenda", "horário de pico": use SEMPRE "time-slots" com timeSlots em HORAS (ex: 09:00, 12:00, 18:00) — nunca use date-pills para horários
• date-pills = dias (SEG 19, TER 20). time-slots = horas (09:00, 14:00)

REGRA DE COERÊNCIA SEMÂNTICA (CRÍTICA — não viole):
• Cada leaf deve APROFUNDAR especificamente o conteúdo do branch PAI, não ser uma dica genérica desconecta
• Se o branch é "Engajamento" (chart-bar com tipos de engajamento), os leaves devem mostrar:
  ✓ Benchmarks de engajamento (stat: "4.2% média")
  ✓ Comparativo de engajamento por formato (comparison)
  ✗ Dica genérica "responda comentários" (não relacionada ao dado mostrado)
• Se o branch é "Timeline de Publicação" (timeline), os leaves devem mostrar:
  ✓ Detalhes específicos de um dos passos (list ou stat)
  ✓ Métricas do processo (chart-ring)
  ✗ Algo totalmente diferente do tema do branch pai
• Pergunte sempre: "Este leaf responde 'O que mais preciso saber especificamente sobre [branch pai]?'"
• NUNCA coloque em um leaf uma informação genérica que poderia estar em qualquer outro branch

• Invente dados REAIS e PLAUSÍVEIS para o tema (não invente números aleatórios)
• Seja EDUCATIVO: os dados devem ENSINAR algo sobre o assunto
• Labels curtos (máx 3 palavras), descriptions concisas (máx 80 chars)
• Todo conteúdo em PORTUGUÊS BRASILEIRO
• Retorne APENAS JSON válido — zero texto adicional, zero markdown, zero backticks

ÍCONES (use EXATAMENTE estes nomes): ${ICONS.join(', ')}

══════════════════
SCHEMA EXATO (siga à risca):
══════════════════
{
  "title": "Título do mapa",
  "description": "Uma frase descrevendo o tema",
  "rootNode": {
    "id": "root",
    "label": "Tema Central",
    "description": "O que é este tema em uma frase",
    "type": "root",
    "icon": "Target",
    "visualType": "default",
    "children": [
      {
        "id": "b1",
        "label": "Taxa de Retenção",
        "description": "Percentual de usuários que continuam",
        "type": "branch",
        "icon": "TrendingUp",
        "visualType": "default",
        "children": [
          {
            "id": "l1-1",
            "label": "Score de Qualidade",
            "description": "Score calculado pelo algoritmo",
            "type": "branch",
            "icon": "Gauge",
            "visualType": "chart-ring",
            "ringValue": 72,
            "ringLabel": "score médio",
            "children": [
              {"id": "l1-1-1", "label": "Ex.: vídeos 60s", "type": "leaf", "icon": "Play", "visualType": "stat", "statValue": "78%", "statLabel": "retenção em 60s"}
            ]
          },
          {
            "id": "l1-2",
            "label": "Fatores Críticos",
            "description": "O que mais impacta a retenção",
            "type": "branch",
            "icon": "Layers",
            "visualType": "list",
            "listItems": [
              {"icon": "Play", "text": "Primeiros 3 segundos"},
              {"icon": "Clock", "text": "Duração ideal por formato"},
              {"icon": "Eye", "text": "Taxa de replay"}
            ],
            "children": [
              {"id": "l1-2-1", "label": "Hook nos 3s", "type": "leaf", "icon": "Zap", "visualType": "highlight", "quote": "Primeira frase deve prender; teste A/B no thumbnail."}
            ]
          }
        ]
      },
      {
        "id": "b2",
        "label": "Peso dos Sinais",
        "description": "Importância relativa de cada fator",
        "type": "branch",
        "icon": "BarChart2",
        "visualType": "default",
        "children": [
          {
            "id": "l2-0",
            "label": "Peso dos Sinais",
            "description": "Importância relativa de cada fator",
            "type": "branch",
            "icon": "BarChart2",
            "visualType": "chart-bar",
            "bars": [
              {"label": "Retenção", "value": 90},
              {"label": "Shares", "value": 80},
              {"label": "Curtidas", "value": 65},
              {"label": "Comentários", "value": 70}
            ],
            "children": [
              {"id": "l2-0-1", "label": "Ex.: Retenção em 30s", "type": "leaf", "icon": "TrendingUp", "visualType": "stat", "statValue": "85%", "statLabel": "média no feed"}
            ]
          },
          {
            "id": "l2-1",
            "label": "Retenção vs Engaj.",
            "description": "Comparativo de impacto",
            "type": "branch",
            "icon": "ArrowRight",
            "visualType": "comparison",
            "compLeft": {"label": "Retenção", "value": "Fator #1 do algoritmo"},
            "compRight": {"label": "Engajamento", "value": "Amplifica alcance"},
            "children": [
              {"id": "l2-1-1", "label": "Na prática", "type": "leaf", "icon": "Lightbulb", "visualType": "highlight", "quote": "Vídeos com alta retenção ganham mais alcance mesmo com menos curtidas."}
            ]
          }
        ]
      },
      {
        "id": "b3",
        "label": "Como Funciona",
        "description": "Processo de distribuição de conteúdo",
        "type": "branch",
        "icon": "Workflow",
        "visualType": "default",
        "children": [
          {
            "id": "l3-0",
            "label": "Passos do Processo",
            "description": "Como a distribuição funciona",
            "type": "leaf",
            "icon": "Workflow",
            "visualType": "timeline",
            "steps": [
              {"label": "Criação", "desc": "Conteúdo é enviado ao servidor"},
              {"label": "Análise", "desc": "IA classifica tema e qualidade"},
              {"label": "Teste", "desc": "Distribuído para 200-500 usuários"},
              {"label": "Escala", "desc": "Bom desempenho = mais alcance"}
            ]
          },
          {
            "id": "l3-1",
            "label": "Evolução Semanal",
            "type": "leaf",
            "icon": "Activity",
            "visualType": "line-chart",
            "lineChartPoints": [{"label": "SEG", "value": 40}, {"label": "TER", "value": 55}, {"label": "QUA", "value": 48}, {"label": "QUI", "value": 72}, {"label": "SEX", "value": 65}],
            "lineChartLabel": "Esta semana"
          },
          {
            "id": "l3-2",
            "label": "Dias no ar",
            "type": "leaf",
            "icon": "Calendar",
            "visualType": "progress-ring",
            "progressRingValue": 5,
            "progressRingMax": 7,
            "progressRingLabel": "dias com publicação"
          }
        ]
      }
    ]
  }
}`;

const PREMIUM_TYPES_SECTION = `
21. "feature-card" — CARD DE FUNCIONALIDADE
    Quando usar: destacar um recurso, beneficio ou diferencial com icone grande
    Campos: label (titulo), featureIcon (nome icone Lucide), featureBadge ("Novo","Beta","Pro" - opcional), featureDesc (descricao curta)

22. "gradient-stat" — METRICA EM GRANDE DESTAQUE
    Quando usar: metrica principal, numero de impacto alto, KPI mais importante
    Campos: label, statValue (ex: "R$48k", "3.2M"), statLabel, statTrend (opcional)

23. "icon-grid" — GRADE DE ICONES
    Quando usar: listar 4-6 categorias, funcionalidades, recursos ou elementos visuais
    Campos: label, iconGrid: [{icon: "NomeLucide", label: "Rotulo curto"}] (4 a 6 itens)

24. "flow-steps" — FLUXO HORIZONTAL COM SETAS
    Quando usar: processo linear com 3-4 etapas conectadas, pipeline, jornada simplificada
    Campos: label, flowSteps: [{label: "Etapa", icon?: "NomeLucide"}] (3 a 4 itens)

25. "testimonial" — DEPOIMENTO / CITACAO DE CLIENTE
    Quando usar: prova social, depoimento, quote de especialista
    Campos: testimonialText (texto do depoimento), testimonialAuthor (nome), testimonialRole (cargo/empresa - opcional)

26. "price-tag" — CARD DE PRECO
    Quando usar: plano, oferta, produto com preco, pacote
    Campos: priceName (nome do plano), priceAmount (ex: "R$47"), pricePeriod ("/mes"), priceFeatures: ["feature 1", "feature 2"] (2-4 itens)

27. "alert-box" — ALERTA / AVISO / DESTAQUE
    Quando usar: avisos importantes, restricoes, prazo, informacao critica
    Campos: alertType ("info"|"warning"|"success"|"error"), alertTitle, alertMessage

28. "metric-trio" — TRES METRICAS LADO A LADO
    Quando usar: dashboard com 3 indicadores principais, comparativo de 3 KPIs
    Campos: label, metricItems: [{value: "2.4k", label: "Descricao", trend?: "+12%"}] (exatamente 3 itens)

29. "kanban-card" — CARD ESTILO KANBAN
    Quando usar: tarefas com status, sprint, board de progresso, lista de afazeres
    Campos: label, kanbanStatus ("Pendente"|"Em Progresso"|"Concluido"|"Bloqueado"), kanbanItems: [{text: "Tarefa", done: true/false}] (2-4 itens)

30. "tag-cloud" — NUVEM DE TAGS / PALAVRAS-CHAVE
    Quando usar: termos chave, hashtags, categorias, palavras de impacto
    Campos: label, tags: [{label: "Tag", size: "sm"|"md"|"lg"}] (5-8 itens, varie os tamanhos)

31. "versus-card" — COMPARATIVO A vs B COM VENCEDOR
    Quando usar: contrastar duas opcoes com pontuacao, escolha entre abordagens
    Campos: label, versusLeft: {label: "Opcao A", score: numero}, versusRight: {label: "Opcao B", score: numero}, versusWinner: "left"|"right"|"tie"

32. "steps-numbered" — PASSOS NUMERADOS VERTICAIS
    Quando usar: tutorial, instrucoes, guia passo a passo, processo sequencial
    Campos: label, numberedSteps: [{title: "Titulo", desc?: "Descricao curta"}] (3 a 4 passos)

33. "social-stat" — METRICA DE REDE SOCIAL
    Quando usar: seguidores, visualizacoes, engajamento em plataformas
    Campos: label, socialValue (ex: "148k", "2.3M"), socialPlatform ("Instagram"|"YouTube"|"TikTok"|"LinkedIn"), socialGrowth (ex: "+2.3k", "+18%")

34. "cta-card" — CALL TO ACTION
    Quando usar: proximos passos, chamada para acao, convidar o usuario a agir
    Campos: ctaTitle, ctaDesc (descricao curta), ctaAction (texto do botao, ex: "Comecar agora")

35. "score-card" — NOTA / PONTUACAO / GRADE
    Quando usar: NPS, nota de qualidade, grade (A+, 9.5/10), score de saude
    Campos: label, scoreValue (ex: "A+", "9.2", "87/100"), scoreLabel (ex: "Excelente"), scoreSub (texto pequeno)

36. "heatmap" — MAPA DE CALOR DE ATIVIDADE SEMANAL
    Quando usar: frequencia semanal, consistencia de habitos, dias de atividade
    Campos: label, heatmapLabel (descricao do que e medido), heatmapPeak (ex: "Sexta", "Manha")

37. "avatar-list" — LISTA DE PESSOAS / TIME
    Quando usar: equipe, comunidade, responsaveis, stakeholders
    Campos: label, avatarItems: [{name: "Nome Completo", role?: "Cargo"}] (2-4 pessoas)

38. "notification-card" — NOTIFICACAO
    Quando usar: alerta recente, conquista, evento, mensagem de sistema
    Campos: notifTitle, notifMessage, notifTime (ex: "2 min", "Agora"), notifType ("info"|"warning"|"success"|"error")

39. "insight-numbered" — INSIGHTS NUMERADOS
    Quando usar: fatos surpreendentes, dados curiosos, aprendizados chave numerados
    Campos: label, insights: [{num: "01", text: "Insight com dado ou fato relevante"}] (2-3 insights)

40. "skill-grid" — HABILIDADES COM NIVEL
    Quando usar: competencias, habilidades com proficiencia, areas de conhecimento
    Campos: label, skills: [{label: "Habilidade", level: 1-5}] (3-5 habilidades)

41. "quote-hero" — CITACAO GRANDE TIPOGRAFICA
    Quando usar: frase de impacto, principio chave, mantra, pensamento central
    Campos: label, quote (texto da citacao, max 100 chars), quoteAuthor (autor - opcional)

42. "compare-table" — TABELA DE COMPARACAO
    Quando usar: comparar dois produtos/planos/abordagens com multiplos criterios
    Campos: label, compareLabels: ["Opcao A", "Opcao B"], compareItems: [{feature: "Criterio", a: true/false ou "texto", b: true/false ou "texto"}] (3-5 itens)

43. "cycle-flow" — PROCESSO CICLICO (4 etapas)
    Quando usar: ciclo de vida, processo continuo, loop de melhoria, ciclo PDCA
    Campos: label, cycleSteps: [{label: "Etapa", icon?: "NomeLucide"}] (exatamente 4 itens)

44. "funnel-bars" — FUNIL DE CONVERSAO
    Quando usar: funil de vendas, pipeline, conversao por etapa
    Campos: label, funnelSteps: [{label: "Etapa", value: numero}] (3-5 etapas, valores decrescentes)

45. "priority-board" — LISTA COM PRIORIDADES
    Quando usar: backlog, lista de tarefas priorizadas, roadmap com urgencia
    Campos: label, priorityItems: [{text: "Item", priority: "high"|"medium"|"low"}] (3-4 itens)

46. "event-card" — CARD DE EVENTO / CALENDARIO
    Quando usar: data de entrega, evento, prazo, lancamento, sessao ao vivo
    Campos: label, eventTitle, eventDate (ex: "15 MAR"), eventTime (ex: "19:00 - 21:00"), eventLocation (ex: "Online via Zoom" - opcional)

47. "growth-indicator" — INDICADOR DE CRESCIMENTO COM SPARKLINE
    Quando usar: crescimento ao longo do tempo, evolucao de resultado, progresso
    Campos: label, growthValue (ex: "+147%"), growthLabel (descricao), growthPoints: [array de 8-12 numeros representando a curva]

48. "team-card" — PERFIL DE MEMBRO DE TIME
    Quando usar: especialista, persona, personagem, responsavel por area
    Campos: label, teamName (nome completo), teamRole (cargo), teamStats: [{label: "Metrica", value: "Valor"}] (2-3 stats)

49. "pill-metrics" — METRICAS EM PILULAS HORIZONTAIS
    Quando usar: indicadores rapidos, painel compacto, multiplos KPIs pequenos
    Campos: label, pillItems: [{label: "Rotulo", value: "Valor", icon?: "NomeLucide"}] (3-4 itens)

50. "code-snippet" — BLOCO DE CODIGO
    Quando usar: exemplos de codigo, comandos, configuracao tecnica, automacao
    Campos: label, codeLang (ex: "javascript", "python", "sql"), codeLines: ["linha 1", "linha 2"] (3-8 linhas)
`;

function buildSystemPrompt(planLevel?: 'essencial' | 'creator' | 'pro'): string {
  const hasPremium = planLevel === 'creator' || planLevel === 'pro';
  const allowedTypesLine = hasPremium
    ? `stat, chart-bar, chart-ring, timeline, comparison, highlight, list, line-chart, progress-bars, progress-ring, countdown, balance, summary, checklist, success, product-row, rating, date-pills, time-slots, feature-card, gradient-stat, icon-grid, flow-steps, testimonial, price-tag, alert-box, metric-trio, kanban-card, tag-cloud, versus-card, steps-numbered, social-stat, cta-card, score-card, heatmap, avatar-list, notification-card, insight-numbered, skill-grid, quote-hero, compare-table, cycle-flow, funnel-bars, priority-board, event-card, growth-indicator, team-card, pill-metrics, code-snippet`
    : `stat, chart-bar, chart-ring, timeline, comparison, highlight, list, line-chart, progress-bars, progress-ring, countdown, balance, summary, checklist, success, product-row, rating, date-pills, time-slots`;

  const premiumSection = hasPremium ? PREMIUM_TYPES_SECTION : '';

  return SYSTEM_PROMPT
    .replace(
      /Somente a partir do nível seguinte \(filhos desses tópicos\) use tipos visuais variados: stat, chart-bar, chart-ring, timeline, comparison, highlight, list, line-chart, progress-bars, progress-ring, countdown, balance, summary, checklist, success, product-row, rating, date-pills, time-slots\./,
      `Somente a partir do nível seguinte (filhos desses tópicos) use tipos visuais variados: ${allowedTypesLine}.`
    )
    .replace(
      /══════════════════\nREGRAS OBRIGATÓRIAS:/,
      `${premiumSection}\n\n══════════════════\nREGRAS OBRIGATÓRIAS:`
    );
}

interface Attachment { base64: string; mimeType: string; name: string; }

async function callModel(model: string, prompt: string, attachment?: Attachment): Promise<string> {
  if (!API_KEY?.trim()) {
    throw new Error('Chave da API Gemini não configurada. Defina NEXT_PUBLIC_GEMINI_API_KEY no .env.local');
  }

  const doFetch = async (version: string): Promise<Response> => {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`;
    const parts: unknown[] = attachment
      ? [{ inlineData: { mimeType: attachment.mimeType, data: attachment.base64 } }, { text: prompt }]
      : [{ text: prompt }];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.65, maxOutputTokens: 16384 },
        }),
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  for (const version of ['v1', 'v1beta']) {
    try {
      let res = await doFetch(version);
      if (res.status === 429 || res.status === 503) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        res = await doFetch(version);
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
        if (res.status === 404 && version === 'v1') continue;
        throw new Error(`${model} (${version}): ${msg}`);
      }
      const data = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!text) throw new Error(`${model}: empty response`);
      return text;
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error(`A API Gemini demorou mais de ${REQUEST_TIMEOUT_MS / 1000}s. Tente um tema mais curto ou tente novamente.`);
      }
      throw e;
    }
  }
  throw new Error(`${model}: modelo não disponível (tente outro tema ou mais tarde)`);
}

const ANNOTATIONS_PROMPT = `
══════════════════
ANOTAÇÕES (inclua apenas se solicitado)
══════════════════
Adicione ao mesmo JSON um objeto "annotations" usando APENAS as chaves que eu pedir explicitamente (arrows, texts, images).
Use APENAS ids de nós que existem na árvore (root, b1, l1-1, etc.).

Schema das possíveis chaves (use somente as que forem pedidas):

- "arrows": array de objetos descrevendo setas adicionais no mapa. Cada objeto segue UM destes formatos:
    • { "fromNodeId": "id do nó", "toNodeId": "id do nó" }
      - Seta ligando dois nós (ex.: causa-efeito, sequência, dependência).
    • { "fromNodeId": "id do nó", "toImageIndex": N }
      - Seta ligando um nó a UMA imagem de referência.
      - "toImageIndex" é um número inteiro (0, 1, 2, ...) que aponta para a posição da imagem dentro do array "images".
- "texts": array de { "nodeId": "id do nó", "text": "Texto curto (insight, anotação)", "fontSize": 24 } — textos extras próximos ao nó.
- "images": array de { "nodeId": "id do nó", "url": "URL direta da imagem (HTTPS, deve terminar em .jpg, .png ou .webp)", "width": 260, "height": 146 } — imagens de referência.
  • OBRIGATÓRIO: a propriedade "url" deve ser um link DIRETO para a imagem (se não tiver um link válido, NÃO crie o item em "images").
  • Priorize bancos de imagens GRATUITOS e conhecidos, como: Freepik, Unsplash, Pexels, Pixabay, StockSnap, entre outros equivalentes.
  • Não use serviços temporários ou que retornam placeholders genéricos (por exemplo, links que mostram apenas "image not found").

Exemplo de "annotations" (apenas ilustrativo; respeite as chaves pedidas):
"annotations": {
  "arrows": [
    {"fromNodeId": "root", "toNodeId": "b1"},
    {"fromNodeId": "b2", "toImageIndex": 0}
  ],
  "texts": [{"nodeId": "b2", "text": "Principais indicadores", "fontSize": 22}],
  "images": [{"nodeId": "root", "url": "https://exemplo.com/imagem.jpg", "width": 260, "height": 146}]
}
`;

/**
 * Gera o mapa em UMA única chamada ao Gemini:
 * - Envia: documento (inlineData) + prompt completo (system + instruções + tema + proporção).
 * - Gemini: lê o documento e as instruções e devolve o JSON completo do mapa na mesma resposta.
 * Não há etapa separada de "resumir" e depois "montar"; tudo é feito em um único generateContent.
 */
export async function generateMindMap(
  prompt: string,
  attachment?: Attachment,
  options?: GenerateMindMapOptions
): Promise<MapData> {
  const context = attachment
    ? `DOCUMENTO ANEXADO: Analise o arquivo "${attachment.name}" em anexo. O conteúdo do documento (perguntas e respostas, seções, tópicos) deve ser a FONTE PRINCIPAL do mapa. Extraia e organize esse conteúdo em um mapa visual que REFLITA a riqueza e a estrutura do material — não resuma em poucos tópicos; use o documento inteiro para montar o mapa.\n\n`
    : '';
  const askAnnotations =
    options?.addExtraTexts || options?.addReferenceImages;
  const allowedKeys: string[] = [];
  const disallowedKeys: string[] = [];
  const annotationParts: string[] = [];
  if (askAnnotations) {
    // Setas serão desenhadas apenas manualmente pelo usuário; NÃO peça mais "arrows" para a IA.
    disallowedKeys.push('"arrows"');
    if (options?.addExtraTexts) {
      annotationParts.push('textos extras (texts)');
      allowedKeys.push('"texts"');
    } else {
      disallowedKeys.push('"texts"');
    }
    if (options?.addReferenceImages) {
      annotationParts.push('imagens de referência com URLs públicas (images)');
      allowedKeys.push('"images"');
    } else {
      disallowedKeys.push('"images"');
    }
  }
  const annotationInstruction =
    askAnnotations
      ? `\n\nINCLUA TAMBÉM anotações no mapa: ${annotationParts.join(', ')}.\n${ANNOTATIONS_PROMPT}
\nNo objeto "annotations":
- USE APENAS as chaves ${allowedKeys.join(', ')}.
- NÃO crie as chaves ${disallowedKeys.join(', ')}.
\nRetorne o JSON do mapa COM o objeto "annotations" no mesmo nível que "title" e "rootNode".`
      : '';

  const promptLength = prompt.trim().length;
  const hasDocument = !!attachment;
  const richnessInstruction = hasDocument
    ? `\n\nPROPORÇÃO DO MAPA (DOCUMENTO ANEXADO — OBRIGATÓRIO):
O usuário anexou um documento. Extraia e organize o conteúdo em um mapa que reflita o material, sem resumir em 2 ou 3 tópicos apenas.
- TÓPICOS PAI (filhos diretos do root): MÍNIMO 5, até 7. Agrupe os principais temas/seções do documento.
- CARDS FILHOS: Em cada tópico pai, 3 a 5 cards que detalham o tema com base no documento (listas, estatísticas, citações quando fizer sentido).
- NÍVEL 3: Cada card de nível 2 deve ter PELO MENOS 1 filho (nível 3) com exemplo ou detalhe extraído do documento.
- Priorize clareza e completude sem exagerar: mapa navegável e útil, sem gerar JSON excessivo que possa ser cortado.`
    : promptLength <= 80
      ? '\n\nPROPORÇÃO DO MAPA: O tema foi dado em poucas palavras. Crie um mapa ENXUTO mas ÚTIL: 2 a 3 tópicos principais (filhos do root). Em cada tópico, 2 a 3 cards de complemento. Cada um desses cards deve ter PELO MENOS 1 filho (nível 3) que afunile com exemplo, caso ou detalhe — para o conteúdo não parar no meio.'
      : promptLength <= 200
        ? '\n\nPROPORÇÃO DO MAPA: O tema tem um tamanho médio. Crie um mapa EQUILIBRADO: 3 a 5 tópicos principais. Em cada tópico, 3 a 5 cards de complemento. Cada um desses cards deve ter PELO MENOS 1 filho (nível 3) que afunile o conteúdo com exemplos ou detalhes aplicados.'
        : '\n\nPROPORÇÃO DO MAPA: O tema foi descrito em detalhes. Crie um mapa RICO e BEM ORGANIZADO: 6 a 10 tópicos principais e 4 a 8 cards de complemento por tópico. OBRIGATÓRIO: cada um desses cards (nível 2) deve ter PELO MENOS 1 filho (nível 3) que afunile o conteúdo — com exemplo concreto, caso de uso, métrica ou detalhe. O nível 3 é onde o mapa aprofunda; não deixe nenhum card de nível 2 sem pelo menos um filho.';

  const numberingInstruction = options?.addNumberedSequence
    ? '\n\nNUMERAÇÃO OBRIGATÓRIA: O mapa deve seguir uma SEQUÊNCIA NUMÉRICA CLARA e ORGANIZADA. Os tópicos principais (filhos do root) devem ser ordenados do MAIS IMPORTANTE ao menos importante e seus labels devem começar com o número: "1. Nome do tópico", "2. Nome do tópico", "3. Nome do tópico", etc. O funil deve afunilar nessa mesma ordem — primeiro o tópico 1 com seus filhos e netos, depois o 2, depois o 3. Nada bagunçado: estrutura linear e numerada, do principal até o final.'
    : '';

  const tecnicoInstruction = options?.layoutMode === 'tecnico'
    ? `\n\nLAYOUT TÉCNICO (OBRIGATÓRIO — cada visual com explicação em texto abaixo):
O foco deste mapa é CONTEÚDO TÉCNICO: mais texto, com visuais sempre explicados.
- ROOT: "visualType": "default" (card de texto/explicação do tema).
- FILHOS DIRETOS DO ROOT (nível 1): cards de CONTEÚDO com "visualType": "default", "type": "branch" — são tópicos explicados em texto.
- Para cada tópico (nível 1), crie 2 a 4 cards VISUAIS (nível 2): stat, chart-bar, timeline, comparison, list, etc., que ilustrem esse tópico.
- REGRA CRÍTICA: Todo card VISUAL (qualquer um que não seja "default") DEVE ter PELO MENOS 1 filho (nível 3) que seja card de TEXTO/EXPLICAÇÃO ("visualType": "default" ou "highlight"), explicando em palavras o que aquele visual mostra e por que importa. Ou seja: Visual → abaixo dele, sempre um card de explicação textual daquele assunto visual.
- Assim o mapa alterna: tópico em texto → visuais que ilustram → sob cada visual, explicação em texto daquele visual. Conteúdo técnico = texto bem explicado + visual + explicação do visual.`
    : '';

  const sysPrompt = buildSystemPrompt(options?.planLevel);
  const full = `${sysPrompt}\n\n${context}══════════════════\nTEMA: ${prompt}\n══════════════════${richnessInstruction}${numberingInstruction}${tecnicoInstruction}${annotationInstruction}\n\nRetorne APENAS o JSON completo, sem nenhum texto antes ou depois.`;
  let lastErr: Error = new Error('No models available');

  for (const model of MODELS) {
    try {
      const text = await callModel(model, full, attachment);
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
      console.log(`✓ ${model}`);
      return data;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      console.warn(`✗ ${model}:`, lastErr.message);
    }
  }
  throw lastErr;
}

/** Gera um ÚNICO nó (card) com um visualType específico, a partir de um tema/resumo. */
export async function generateCardNode(visualType: VisualType, topic: string, planLevel?: 'essencial' | 'creator' | 'pro'): Promise<Partial<MapNode>> {
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

  let lastErr: Error = new Error('No models available');
  for (const model of MODELS) {
    try {
      const text = await callModel(model, prompt);
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned) as Partial<MapNode>;
      return parsed;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      console.warn(`✗ generateCardNode ${model}:`, lastErr.message);
    }
  }
  throw lastErr;
}

/** Gera um novo nó complementar para um nó existente (usado no botão “+ Conteúdo”). */
export async function generateNodeExpansion(baseNode: MapNode, planLevel?: 'essencial' | 'creator' | 'pro'): Promise<Partial<MapNode>> {
  const clone: MapNode = {
    ...baseNode,
    children: undefined,
  };
  const snippet = JSON.stringify(clone, null, 2);
  const sysPromptForExpansion = buildSystemPrompt(planLevel);
  const prompt = `\\

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

  let lastErr: Error = new Error('No models available');
  for (const model of MODELS) {
    try {
      const text = await callModel(model, prompt);
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned) as Partial<MapNode>;
      return parsed;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      console.warn(`✗ ${model} (expand):`, lastErr.message);
    }
  }
  throw lastErr;
}

