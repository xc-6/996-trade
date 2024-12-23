import { useRecordId } from "./use-record-id";
export const usePanel = () => {
  const [recordId, setRecordId] = useRecordId();

  const onSelect = (id: string) => {
    setRecordId(id);
  };

  const onClose = () => {
    setRecordId(null);
  };

  return {
    recordId,
    onSelect,
    onClose
  };
};
