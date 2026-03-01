export type DrawTool = 'select' | 'text' | 'arrow' | 'image';

export type TextAlign = 'start' | 'middle' | 'end';

export interface DrawText {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  textAnchor?: TextAlign;
  /** Opcional: id do nó ao qual este texto está logicamente ligado (para ocultar junto com o funil). */
  attachedToNodeId?: string;
}

export interface DrawArrow {
  id: string;
  type: 'arrow';
  points: { x: number; y: number }[]; // waypoints, Catmull-Rom smoothed
  color: string;
  strokeWidth: number;
}

export interface DrawImage {
  id: string;
  type: 'image';
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
  /** Proporção largura/altura (ex.: 16/9). Usado para redimensionar sem distorcer. */
  aspectRatio?: number;
  /** Opcional: id do nó ao qual esta imagem está logicamente ligada (para ocultar junto com o funil). */
  attachedToNodeId?: string;
}

export type DrawElement = DrawText | DrawArrow | DrawImage;
