// DragContext.js
import { createContext, useContext, useState } from "react";

const DragContext = createContext();

export const DragProvider = ({ children }) => {
    const [draggingData, setDraggingData] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [dragOverTargetListId, setDragOverTargetListId] = useState(null);
    const [draggingSourceListId, setDraggingSourceListId] = useState(null);
    const [removeFromListSignal, setRemoveFromListSignal] = useState(null);

    return (
        <DragContext.Provider value={{
            draggingData,
            setDraggingData,
            draggingIndex,
            setDraggingIndex,
            dragOverIndex,
            setDragOverIndex,
            dragOverTargetListId,
            setDragOverTargetListId,
            draggingSourceListId,
            setDraggingSourceListId,
            removeFromListSignal,
            setRemoveFromListSignal,
        }}>
            {children}
        </DragContext.Provider>
    );
};

export const useDragContext = () => useContext(DragContext);
