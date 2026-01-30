import { planFromText, runPlan } from '@/lib/analysisApi';
import { useMutation } from '@tanstack/react-query';

export const usePlanFromText = () => {
  return useMutation({ mutationFn: planFromText });
};

export const useRunPlan = () => {
  return useMutation({ mutationFn: runPlan });
};
