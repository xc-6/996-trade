import { useQueryState } from "nuqs";

export const useRecordId = () => {
  return useQueryState("id");
};
