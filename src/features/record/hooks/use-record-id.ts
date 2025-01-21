import { useQueryState } from "nuqs";

export const useId = () => {
  return useQueryState("id");
};
