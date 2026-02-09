import { api } from './api';

export type AnalysisMode = 'manual' | 'chat';

export type ManualDraft = {
  kind: 'metric' | 'breakdown';
  preset: 'month_to_date' | 'last_30_days' | 'today';
  metric: 'sum' | 'count';
  breakdownBy?: 'day' | 'category' | 'item';
  categoryName?: string;
  itemName?: string;
  limit?: number;
};

export type PlanFromTextResponse = {
  plan: any;
  rationale?: string;
  warnings?: string[];
};

export type RunPlanResponse = {
  result: any;
  meta?: any;
};

export const planFromText = async (vars: { question: string; timezone: string }) => {
  const { data } = await api.post<PlanFromTextResponse>('/analysis/plan', vars);
  return data;
};

export const runPlan = async (vars: { plan: any; timezone: string }) => {
  const { data } = await api.post<RunPlanResponse>('/analysis/run', vars);
  return data;
};

const mapGroupBy = (g: NonNullable<ManualDraft['breakdownBy']>) => {
  if (g === 'category') return 'category' as const;
  if (g === 'item') return 'item' as const;
  return 'day' as const;
};

export const buildPlan = (d: ManualDraft, timezone: string): any => {
  const filters =
    d.categoryName || d.itemName
      ? {
          categoryName: d.categoryName || undefined,
          itemName: d.itemName || undefined,
        }
      : undefined;

  const range = {
    preset: d.preset,
    timezone,
  };

  const op = d.metric;

  if (d.kind === 'metric') {
    return {
      kind: 'metric',
      op,
      field: 'amountCents',
      range,
      filters,
    };
  }

  return {
    kind: 'breakdown',
    op,
    field: 'amountCents',
    groupBy: mapGroupBy(d.breakdownBy ?? 'day'),
    range,
    filters,
    limit: d.limit ?? 20,
  };
};
