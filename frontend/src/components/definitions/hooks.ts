import { useMutation } from "@tanstack/react-query";
import { likesApi } from "@/lib/api/likes";

export function useLike(props: { definitionId: string }) {
  const { mutate, isPending } = useMutation({
    onMutate: async () => {
      await likesApi.toggle(props.definitionId);
    },
  });

  return { toggleLike: mutate, isPending };
}
