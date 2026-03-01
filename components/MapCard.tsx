'use client';

import { LayoutNode } from '@/lib/types';
import {
  NodeProps,
  DefaultNode,
  StatNode,
  ChartBarNode,
  ChartRingNode,
  TimelineNode,
  ComparisonNode,
  HighlightNode,
  ListNode,
  LineChartNode,
  ProgressBarsNode,
  ProgressRingNode,
  CountdownNode,
  BalanceNode,
  SummaryNode,
  ChecklistNode,
  SuccessNode,
  ProductRowNode,
  RatingNode,
  DatePillsNode,
  TimeSlotsNode,
} from './NodeRenderers';
import {
  FeatureCardNode,
  GradientStatNode,
  IconGridNode,
  FlowStepsNode,
  TestimonialNode,
  PriceTagNode,
  AlertBoxNode,
  MetricTrioNode,
  KanbanCardNode,
  TagCloudNode,
  VersusCardNode,
  StepsNumberedNode,
  SocialStatNode,
  CtaCardNode,
  ScoreCardNode,
  HeatmapNode,
  AvatarListNode,
  NotificationCardNode,
  InsightNumberedNode,
  SkillGridNode,
  QuoteHeroNode,
  CompareTableNode,
  CycleFlowNode,
  FunnelBarsNode,
  PriorityBoardNode,
  EventCardNode,
  GrowthIndicatorNode,
  TeamCardNode,
  PillMetricsNode,
  CodeSnippetNode,
  SocialIconNode,
} from './NodeRenderersV2';

export default function MapCard(props: NodeProps) {
  const { node } = props;
  const vt = node.visualType ?? 'default';

  switch (vt) {
    // ── Essencial (20 tipos) ──────────────────────────────────────────────────
    case 'stat':
      if (!node.statValue) return <DefaultNode {...props} />;
      return <StatNode {...props} />;

    case 'chart-bar':
      if (!node.bars?.length) return <DefaultNode {...props} />;
      return <ChartBarNode {...props} />;

    case 'chart-ring':
      if (node.ringValue == null) return <DefaultNode {...props} />;
      return <ChartRingNode {...props} />;

    case 'timeline':
      if (!node.steps?.length) return <DefaultNode {...props} />;
      return <TimelineNode {...props} />;

    case 'comparison':
      if (!node.compLeft && !node.compRight) return <DefaultNode {...props} />;
      return <ComparisonNode {...props} />;

    case 'highlight':
      if (!node.quote && !node.description) return <DefaultNode {...props} />;
      return <HighlightNode {...props} />;

    case 'list':
      if (!node.listItems?.length) return <DefaultNode {...props} />;
      return <ListNode {...props} />;

    case 'line-chart':
      if (!node.lineChartPoints?.length) return <DefaultNode {...props} />;
      return <LineChartNode {...props} />;

    case 'progress-bars':
      if (!node.progressBars?.length) return <DefaultNode {...props} />;
      return <ProgressBarsNode {...props} />;

    case 'progress-ring':
      if (node.progressRingValue == null && node.progressRingMax == null) return <DefaultNode {...props} />;
      return <ProgressRingNode {...props} />;

    case 'countdown':
      if (!node.countdownValue && !node.countdownLabel) return <DefaultNode {...props} />;
      return <CountdownNode {...props} />;

    case 'balance':
      if (!node.balanceValue && !node.balanceLabel) return <DefaultNode {...props} />;
      return <BalanceNode {...props} />;

    case 'summary':
      if (!node.summaryItems?.length) return <DefaultNode {...props} />;
      return <SummaryNode {...props} />;

    case 'checklist':
      if (!node.checklistItems?.length) return <DefaultNode {...props} />;
      return <ChecklistNode {...props} />;

    case 'success':
      if (!node.successTitle && !node.label) return <DefaultNode {...props} />;
      return <SuccessNode {...props} />;

    case 'product-row':
      if (!node.productTitle && !node.label) return <DefaultNode {...props} />;
      return <ProductRowNode {...props} />;

    case 'rating':
      if (!node.ratingValue && !node.ratingLabel) return <DefaultNode {...props} />;
      return <RatingNode {...props} />;

    case 'date-pills':
      if (!node.datePills?.length) return <DefaultNode {...props} />;
      return <DatePillsNode {...props} />;

    case 'time-slots':
      if (!node.timeSlots?.length) return <DefaultNode {...props} />;
      return <TimeSlotsNode {...props} />;

    // ── Creator / Pro (30 tipos premium) ─────────────────────────────────────
    case 'feature-card':
      return <FeatureCardNode {...props} />;

    case 'gradient-stat':
      if (!node.statValue) return <DefaultNode {...props} />;
      return <GradientStatNode {...props} />;

    case 'icon-grid':
      if (!node.iconGrid?.length) return <DefaultNode {...props} />;
      return <IconGridNode {...props} />;

    case 'flow-steps':
      if (!node.flowSteps?.length) return <DefaultNode {...props} />;
      return <FlowStepsNode {...props} />;

    case 'testimonial':
      return <TestimonialNode {...props} />;

    case 'price-tag':
      return <PriceTagNode {...props} />;

    case 'alert-box':
      return <AlertBoxNode {...props} />;

    case 'metric-trio':
      if (!node.metricItems?.length) return <DefaultNode {...props} />;
      return <MetricTrioNode {...props} />;

    case 'kanban-card':
      return <KanbanCardNode {...props} />;

    case 'tag-cloud':
      if (!node.tags?.length) return <DefaultNode {...props} />;
      return <TagCloudNode {...props} />;

    case 'versus-card':
      return <VersusCardNode {...props} />;

    case 'steps-numbered':
      if (!node.numberedSteps?.length) return <DefaultNode {...props} />;
      return <StepsNumberedNode {...props} />;

    case 'social-stat':
      return <SocialStatNode {...props} />;

    case 'cta-card':
      return <CtaCardNode {...props} />;

    case 'score-card':
      return <ScoreCardNode {...props} />;

    case 'heatmap':
      return <HeatmapNode {...props} />;

    case 'avatar-list':
      if (!node.avatarItems?.length) return <DefaultNode {...props} />;
      return <AvatarListNode {...props} />;

    case 'notification-card':
      return <NotificationCardNode {...props} />;

    case 'insight-numbered':
      if (!node.insights?.length) return <DefaultNode {...props} />;
      return <InsightNumberedNode {...props} />;

    case 'skill-grid':
      if (!node.skills?.length) return <DefaultNode {...props} />;
      return <SkillGridNode {...props} />;

    case 'quote-hero':
      return <QuoteHeroNode {...props} />;

    case 'compare-table':
      if (!node.compareItems?.length) return <DefaultNode {...props} />;
      return <CompareTableNode {...props} />;

    case 'cycle-flow':
      if (!node.cycleSteps?.length) return <DefaultNode {...props} />;
      return <CycleFlowNode {...props} />;

    case 'funnel-bars':
      if (!node.funnelSteps?.length) return <DefaultNode {...props} />;
      return <FunnelBarsNode {...props} />;

    case 'priority-board':
      if (!node.priorityItems?.length) return <DefaultNode {...props} />;
      return <PriorityBoardNode {...props} />;

    case 'event-card':
      return <EventCardNode {...props} />;

    case 'growth-indicator':
      return <GrowthIndicatorNode {...props} />;

    case 'team-card':
      return <TeamCardNode {...props} />;

    case 'pill-metrics':
      if (!node.pillItems?.length) return <DefaultNode {...props} />;
      return <PillMetricsNode {...props} />;

    case 'code-snippet':
      return <CodeSnippetNode {...props} />;

    case 'social-icon':
      return <SocialIconNode {...props} />;

    default:
      return <DefaultNode {...props} />;
  }
}
