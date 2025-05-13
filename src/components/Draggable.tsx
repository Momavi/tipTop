import { useDraggable } from '@dnd-kit/react';

export function Draggable({ id, text}: any) {
  const { ref } = useDraggable({
    id,
  });

  return (
    <button ref={ref}>
      <p>Игрок: {text.username}</p>
      <p>Ответ: {text.answer}</p>
    </button>
  );
}

export default Draggable;