import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

type SendMessageVars = {
  message: string;
};

type SendMessageResponse = {
  text: string;
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (vars: SendMessageVars) => {
      const res = await api.post<SendMessageResponse>('/chat', vars);
      return res?.data;
    },
  });
};
