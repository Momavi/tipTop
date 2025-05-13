import { useDroppable } from '@dnd-kit/react';

export function Droppable({ id, children }: any) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div ref={ref} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 300,
      height: 300,
      backgroundColor: isDropTarget ? '#1eb99d25' : '#aaa',
      border: '3px solid',
      borderColor: isDropTarget ? '#1eb99d' : '#00000020',
      borderRadius: 10,
      content: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column'}}>
        <span style={{marginBottom: 20, fontSize: 24}}>{id + 1}</span>
        {children}
      </div>
    </div>
  );
}

export default Droppable;