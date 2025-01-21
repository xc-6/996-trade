import { useId } from "./use-record-id";
export const usePanel = () => {
  const [id, setId] = useId();

  const onSelect = (id: string) => {
    setId(id);
  };

  const onClose = () => {
    setId(null);
  };

  return {
    id,
    onSelect,
    onClose,
  };
};
