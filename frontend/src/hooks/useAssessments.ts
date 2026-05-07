import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '../services/api';
import type { Evaluation, EvaluationCreate } from '../types/api';

export const useAssessments = () => {
  const queryClient = useQueryClient();

  const historyQuery = useQuery<Evaluation[]>({
    queryKey: ['assessments', 'history'],
    queryFn: async () => {
      const response = await assessmentApi.getHistory();
      return response.data.sort((a: Evaluation, b: Evaluation) => 
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: EvaluationCreate) => assessmentApi.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'history'] });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,
    submitEvaluation: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
};
