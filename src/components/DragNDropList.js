import { Fragment, useEffect } from "react";
import { useDragContext } from "./DragContext";

const DragNDropList = ({listItems, listId, onChange, isDroppable = true}) => {
    const {
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
    } = useDragContext();

    useEffect(() => {
        if (
            onChange &&
            removeFromListSignal &&
            removeFromListSignal.listId === listId &&
            listItems.some(item => item.id === removeFromListSignal.itemId)
        ) {
            const updated = listItems.filter(item => item.id !== removeFromListSignal.itemId);
            onChange(updated);
            setRemoveFromListSignal(null); // Reset signal
        }
    }, [removeFromListSignal, listId, listItems, onChange, setRemoveFromListSignal]);

    // Drag
    const handleOnDrag = (data, index) => {
        setDraggingData(data ?? null);
        setDraggingIndex(index ?? null);
        setDraggingSourceListId(listId);
        setDragOverIndex(null);
    };


    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragOverIndex !== index || dragOverTargetListId !== listId) {
            setDragOverIndex(index);
            setDragOverTargetListId(listId);
        }
    };

    // Drag over empty space after last item
    const handleDragOverEmpty = (e) => {
        e.preventDefault();
        // Only update dragOverIndex if hovering *directly* over the container div (not its children)
        if (e.target === e.currentTarget) {
            if (dragOverIndex !== listItems.length || dragOverTargetListId !== listId) {
                setDragOverIndex(listItems.length);
                setDragOverTargetListId(listId)
            }
        }
    };

    // Drop
    const handleOnDrop = () => {
        if (!isDroppable) return;

        if (draggingData) {
            // Reorder within the same list
            if (draggingSourceListId === listId) {
                if (draggingIndex !== null && dragOverIndex !== null && ![draggingIndex, draggingIndex + 1].includes(dragOverIndex)) {
                    const updated = [...listItems];
                    const [moved] = updated.splice(draggingIndex, 1);
                    updated.splice(dragOverIndex, 0, moved);
                    onChange(updated);
                }
            } 
            // Cross-list drop
            else {
                const alreadyInList = listItems.some(item => item.id === draggingData.id);
                if (!alreadyInList) {
                    const insertIndex = dragOverIndex !== null ? dragOverIndex : listItems.length;
                    const updated = [...listItems];
                    updated.splice(insertIndex, 0, draggingData);
                    onChange(updated);
                }

                // 🔥 Tell the source list to remove the item
                setRemoveFromListSignal({
                    listId: draggingSourceListId,
                    itemId: draggingData.id
                });
            }
        }

        // Reset drag state
        setDraggingData(null);
        setDraggingIndex(null);
        setDragOverIndex(null);
        setDragOverTargetListId(null);
        setDraggingSourceListId(null);
    };


    const Placeholder = () => (
        <div
            style={{
                width: 80,
                height: 40,
                background: "#d0f0ff",
                borderRadius: 4,
                flexShrink: 0
            }}
        />
    )

    const draggableListStyle = {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap", // optional
        minHeight: "4rem",
        border: "1px solid black",
        padding: "4px",
        gap: "4px"
    }

    const draggableItemStyle = {
        padding: "8px",
        border: "1px dashed gray",
        width: 80,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        flexShrink: 0
    }

    return isDroppable
        ? <div
            style={draggableListStyle}
            onDrop={handleOnDrop}
            onDragOver={handleDragOverEmpty}
        >
            {listItems.map((item, index) => {
                const showPlaceholder = dragOverTargetListId === listId && dragOverIndex === index && (!draggingIndex || ![draggingIndex, draggingIndex + 1].includes(dragOverIndex));

                return (
                    <Fragment key={`${listId}-id-${item.id}`}>
                        {showPlaceholder && <Placeholder/>}
                        <div
                            draggable
                            onDragStart={() => handleOnDrag(item, index)}
                            onDrop={handleOnDrop}
                            onDragOver={(e) => handleDragOver(e, index)}
                            style={draggableItemStyle}
                        >
                            {item.name}
                        </div>
                    </Fragment>
                )
            })}
            {dragOverTargetListId === listId && dragOverIndex === listItems.length && <Placeholder/>}
        </div>
        : <div>
            {listItems.map((item) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleOnDrag(item, null)}
                    style={{ padding: "4px", border: "1px solid gray", margin: "2px", cursor: "grab" }}
                >
                    {item.name}
                </div>
            ))}
        </div>
}

export default DragNDropList;