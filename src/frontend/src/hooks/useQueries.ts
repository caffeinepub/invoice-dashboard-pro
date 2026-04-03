import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface AnimationProject {
  name: string;
  jsonData: string;
  created: bigint;
}

export function useListProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<AnimationProject[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      jsonData,
    }: { name: string; jsonData: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.saveProject(name, jsonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
