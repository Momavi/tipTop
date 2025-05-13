import type { GameAnswer } from "./TipTopTypes"
import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import Draggable from "../../components/Draggable";
import Droppable from "../../components/Droppable";

function TipTopPlay({ allAnswers, submitOrder }: any) {

  const [parent, setParent] = useState<string | number | null>();
  const [parent2, setParent2] = useState<string | number | null>();
  const [parent3, setParent3] = useState<string | number | null>();

  return (
    <>
      <h3>Ответы игроков:</h3>
      <div className="answers-list">
        <DragDropProvider
          onDragEnd={(event) => {
            const { target, source } = event.operation;
            console.log(source);

            if (event.canceled) return;
            if (source && source.id === "draggable1") {
              console.log('1')
              setParent(target ? target.id : null);
            }
            if (source && source.id === "draggable2") {
              console.log('2')
              setParent2(target ? target.id : null);
            }
            if (source && source.id === "draggable3") {
              console.log('3')
              setParent3(target ? target.id : null);
            }
          }}
        >
          {allAnswers.map((answer: GameAnswer, index: number) => (
            <>
              {/* <Sortable
                children='dd'
                id={index}
                index={index}
                key={index}
                username={answer.username}
                answer={answer.answer}
              /> */}
              <section>
                <Droppable key={index} id={index} className="droppable-container">
                  {parent === index ? <Draggable id="draggable1" text={answer} /> : null}
                  {parent2 === index ? <Draggable id="draggable2" text={answer} /> : null}
                  {parent3 === index ? <Draggable id="draggable3" text={answer} /> : null}
                </Droppable>
                <div className="question-container">
                  {index === 0 ? <div>{parent == null ? <Draggable id="draggable1" text={answer} /> : null}</div> : null}
                  {index === 1 ? <div>{parent2 == null ? <Draggable id="draggable2" text={answer} /> : null}</div> : null}
                  {index === 2 ? <div>{parent3 == null ? <Draggable id="draggable3" text={answer} /> : null}</div> : null}
                </div>
              </section>
            </>
          ))}
        </DragDropProvider>
      </div>
      <button onClick={submitOrder} className="submit-order-btn">
        Подтвердить порядок
      </button>
    </>
  )
}

export default TipTopPlay