import { useSortable } from '@dnd-kit/react/sortable';

interface Props {
  id: number;
  children: string;
  username: string;
  answer: string;
  index: number;
}

function Draggable(props: Props) {
  const { ref } = useSortable({ id: props.id, index: props.index });

  return (
    <li
      className="draggable-card"
      ref={ref}
    >
      {props.answer}
    </li>
  );
}

export default Draggable;