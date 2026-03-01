export type VisualType =
  // Tier Essencial (20 tipos padrao)
  | 'default'
  | 'stat'
  | 'chart-bar'
  | 'chart-ring'
  | 'timeline'
  | 'comparison'
  | 'highlight'
  | 'list'
  | 'line-chart'
  | 'progress-bars'
  | 'progress-ring'
  | 'countdown'
  | 'balance'
  | 'summary'
  | 'checklist'
  | 'success'
  | 'product-row'
  | 'rating'
  | 'date-pills'
  | 'time-slots'
  // Tier Creator / Pro (30 tipos premium)
  | 'feature-card'
  | 'gradient-stat'
  | 'icon-grid'
  | 'flow-steps'
  | 'testimonial'
  | 'price-tag'
  | 'alert-box'
  | 'metric-trio'
  | 'kanban-card'
  | 'tag-cloud'
  | 'versus-card'
  | 'steps-numbered'
  | 'social-stat'
  | 'cta-card'
  | 'score-card'
  | 'heatmap'
  | 'avatar-list'
  | 'notification-card'
  | 'insight-numbered'
  | 'skill-grid'
  | 'quote-hero'
  | 'compare-table'
  | 'cycle-flow'
  | 'funnel-bars'
  | 'priority-board'
  | 'event-card'
  | 'growth-indicator'
  | 'team-card'
  | 'pill-metrics'
  | 'code-snippet'
  // Tier Ícones Sociais
  | 'social-icon';

export type LayoutMode      = 'top-down' | 'left-right' | 'tecnico';
export type ConnectionStyle = 'bezier'   | 'straight'   | 'angular';

export interface MapNode {
  id: string;
  label: string;
  description?: string;
  type: 'root' | 'branch' | 'leaf';
  icon?: string;
  visualType?: VisualType;

  // stat
  statValue?: string;
  statLabel?: string;
  statTrend?: string;

  // chart-bar
  bars?: Array<{ label: string; value: number }>;

  // chart-ring
  ringValue?: number;
  ringLabel?: string;

  // timeline
  steps?: Array<{ label: string; desc?: string }>;

  // comparison
  compLeft?: { label: string; value?: string };
  compRight?: { label: string; value?: string };

  // highlight
  quote?: string;

  // list
  listItems?: Array<{ icon?: string; text: string }>;

  // line-chart
  lineChartPoints?: Array<{ label: string; value: number }>;
  lineChartPoints2?: Array<{ label: string; value: number }>;
  lineChartLabel?: string;
  lineChartLabel2?: string;

  // progress-bars
  progressBars?: Array<{ label: string; value: number; max?: number }>;

  // progress-ring
  progressRingValue?: number;
  progressRingMax?: number;
  progressRingLabel?: string;

  // countdown
  countdownValue?: string;
  countdownLabel?: string;
  countdownSubtext?: string;

  // balance
  balanceLabel?: string;
  balanceValue?: string;
  balanceAction?: string;

  // summary
  summaryItems?: Array<{ label: string; value: string }>;
  summaryTitle?: string;

  // checklist
  checklistItems?: Array<{ text: string; done?: boolean }>;

  // success
  successTitle?: string;
  successMessage?: string;
  successButton?: string;

  // product-row
  productTitle?: string;
  productSubtitle?: string;
  productPrice?: string;
  productPrice2?: string;
  productCta?: string;

  // rating
  ratingValue?: string;
  ratingMax?: number;
  ratingLabel?: string;
  ratingSubtext?: string;

  // date-pills
  datePills?: Array<{ label: string; date: string; selected?: boolean }>;

  // time-slots
  timeSlots?: Array<{ label?: string; time: string; selected?: boolean }>;

  // ── PREMIUM TYPES (Creator / Pro) ──────────────────────────────────────────

  // feature-card
  featureIcon?: string;
  featureBadge?: string;
  featureDesc?: string;

  // icon-grid
  iconGrid?: Array<{ icon: string; label: string }>;

  // flow-steps
  flowSteps?: Array<{ label: string; icon?: string }>;

  // testimonial
  testimonialText?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;

  // price-tag
  priceName?: string;
  priceAmount?: string;
  pricePeriod?: string;
  priceFeatures?: string[];

  // alert-box
  alertType?: 'info' | 'warning' | 'success' | 'error';
  alertTitle?: string;
  alertMessage?: string;

  // metric-trio
  metricItems?: Array<{ value: string; label: string; trend?: string }>;

  // kanban-card
  kanbanStatus?: string;
  kanbanItems?: Array<{ text: string; done?: boolean }>;

  // tag-cloud
  tags?: Array<{ label: string; size?: 'sm' | 'md' | 'lg' }>;

  // versus-card
  versusLeft?: { label: string; score?: number | string };
  versusRight?: { label: string; score?: number | string };
  versusWinner?: 'left' | 'right' | 'tie';

  // steps-numbered
  numberedSteps?: Array<{ title: string; desc?: string }>;

  // social-stat
  socialValue?: string;
  socialPlatform?: string;
  socialGrowth?: string;

  // cta-card
  ctaTitle?: string;
  ctaDesc?: string;
  ctaAction?: string;

  // score-card
  scoreValue?: string;
  scoreLabel?: string;
  scoreSub?: string;

  // heatmap
  heatmapLabel?: string;
  heatmapPeak?: string;

  // avatar-list
  avatarItems?: Array<{ name: string; role?: string }>;

  // notification-card
  notifTitle?: string;
  notifMessage?: string;
  notifTime?: string;
  notifType?: 'info' | 'warning' | 'success' | 'error';

  // insight-numbered
  insights?: Array<{ num: string; text: string }>;

  // skill-grid
  skills?: Array<{ label: string; level: number }>;

  // quote-hero (also uses quote field)
  quoteAuthor?: string;

  // compare-table
  compareLabels?: [string, string];
  compareItems?: Array<{ feature: string; a: string | boolean; b: string | boolean }>;

  // cycle-flow
  cycleSteps?: Array<{ label: string; icon?: string }>;

  // funnel-bars
  funnelSteps?: Array<{ label: string; value: number }>;

  // priority-board
  priorityItems?: Array<{ text: string; priority: 'high' | 'medium' | 'low' }>;

  // event-card
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;

  // growth-indicator (reuses lineChartPoints for sparkline)
  growthValue?: string;
  growthLabel?: string;
  growthPoints?: number[];

  // team-card
  teamName?: string;
  teamRole?: string;
  teamStats?: Array<{ label: string; value: string }>;

  // pill-metrics
  pillItems?: Array<{ label: string; value: string; icon?: string }>;

  // code-snippet
  codeLang?: string;
  codeLines?: string[];

  // social-icon (socialPlatform shared with social-stat above)
  socialHandle?: string;
  socialFollowers?: string;

  children?: MapNode[];
}

export interface MapAnnotations {
  /**
   * Setas entre nos ou entre um no e uma imagem.
   * - Caso "toNodeId" seja fornecido, a seta vai de no para no.
   * - Caso "toImageIndex" seja fornecido (numero inteiro >= 0), a seta aponta para a imagem
   *   correspondente em annotations.images[toImageIndex].
   */
  arrows?: { fromNodeId: string; toNodeId?: string; toImageIndex?: number }[];
  texts?: { nodeId: string; text: string; fontSize?: number; textAnchor?: 'start' | 'middle' | 'end' }[];
  images?: { nodeId: string; url: string; width?: number; height?: number }[];
}

export interface MapData {
  title: string;
  description: string;
  rootNode: MapNode;
  theme?: string;
  layoutMode?: LayoutMode;
  connectionStyle?: ConnectionStyle;
  annotations?: MapAnnotations;
}

export interface MapGeneration {
  id: string;
  title: string;
  prompt: string;
  map_data: MapData;
  created_at: string;
  updated_at: string;
  share_token?: string | null;
  is_public?: boolean;
}

export interface LayoutNode extends MapNode {
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  parentId?: string;
}
