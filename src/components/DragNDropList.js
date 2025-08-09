import { Fragment, useEffect } from "react";
import { useDragContext } from "./DragContext";

const DragNDropList = ({listItems, listId, onChange, isDroppable = true}) => {
    const {
        // Data of the dragged element
        draggingData,
        setDraggingData,
        // Index of the position of dragged element in the original list
        draggingIndex,
        setDraggingIndex,
        // Index of the element below the dragged one while dragging
        dragOverIndex,
        setDragOverIndex,
        // Id of the list below the dragged element while dragging
        dragOverTargetListId,
        setDragOverTargetListId,
        // Id of the original list the dragged element comes from
        draggingSourceListId,
        setDraggingSourceListId,
        // Signal to make a list now it need to delete an element from itself
        removeFromListSignal,
        setRemoveFromListSignal,
    } = useDragContext();

    // Detect a removeFromListSignal exists and if its related to this listId delete the element that should be deleted
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

    // When starting a drag save the data necessary
    const handleOnDrag = (data, index) => {
        setDraggingData(data ?? null);
        setDraggingIndex(index ?? null);
        setDraggingSourceListId(listId);
        setDragOverIndex(null);
    };

    // When hovering over other element save the data from those elements
    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragOverIndex !== index || dragOverTargetListId !== listId) {
            setDragOverIndex(index);
            setDragOverTargetListId(listId);
        }
    };

    // When hovering over empty space set the data to the last position in the list
    const handleDragOverEmpty = (e) => {
        e.preventDefault();
        if (e.target === e.currentTarget) {
            if (dragOverIndex !== listItems.length || dragOverTargetListId !== listId) {
                setDragOverIndex(listItems.length);
                setDragOverTargetListId(listId)
            }
        }
    };

    // When dropping and element handle the logic depending on the list type and where it was dropped
    const handleOnDrop = () => {
        if (!isDroppable) return; // For copy list, not reordable

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

                    setRemoveFromListSignal({
                        listId: draggingSourceListId,
                        itemId: draggingData.id
                    });
                }
            }
        }

        // Always reset dragging data when dropping has ended
        setDraggingData(null);
        setDraggingIndex(null);
        setDragOverIndex(null);
        setDragOverTargetListId(null);
        setDraggingSourceListId(null);
    };

    // Void div used to show the user where the dragged element would drop before its actually dropped
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
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.2)",
        display: "flex",
        flex: "1 1 0",
        flexDirection: "row",
        gap: "0.5rem",
        justifyContent: listItems?.length ? "flex-start" : "center",
        maxWidth: "100%",
        minHeight: "3rem",
        overflowX: "auto",
        padding: "2px",
        whiteSpace: "nowrap",
        scrollbarGutter: "stable"
    }

    const draggableItemStyle = {
        alignSelf: "center",
        border: "1px solid gray",
        borderRadius: "0.375rem",
        cursor: "grab",
        display: "inline-block",
        paddingInline: "4px",
        paddingBlock: "0.25px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        height: 40,
        width: 80,
        lineHeight: "40px",
        textAlign: "center",
    }

    return isDroppable
        ? <div
            style={draggableListStyle}
            onDrop={handleOnDrop}
            onDragOver={handleDragOverEmpty}
        >
            {isDroppable && listItems.length <= 0 && <span style={{color: "gray"}}>Drop items here</span>}
            {listItems.map((item, index) => {
                const showPlaceholder = dragOverTargetListId === listId && dragOverIndex === index && (listId !== draggingSourceListId || draggingIndex === undefined || draggingIndex === null || ![draggingIndex, draggingIndex + 1].includes(dragOverIndex));

                return (
                    <Fragment key={`${listId}-id-${item.id}`}>
                        {listItems.length === 0 && isDroppable && <span>Drop here</span>}
                        {showPlaceholder && <Placeholder/>}
                        <div
                            draggable
                            onDragStart={() => handleOnDrag(item, index)}
                            onDrop={handleOnDrop}
                            onDragOver={(e) => handleDragOver(e, index)}
                        >
                            <span 
                                style={draggableItemStyle}
                            >
                                {item.name}
                            </span>
                        </div>
                    </Fragment>
                )
            })}
            {dragOverTargetListId === listId && dragOverIndex === listItems.length && draggingIndex !== listItems.length - 1 && <Placeholder/>}
        </div>
        : <div
            className="border rounded p-2 d-flex flex-column gap-1"
            style={{ minWidth: "10rem", position: "relative" }}
        >
            {listItems.map((item) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleOnDrag(item, null)}
                    className="border rounded px-2 py-1 bg-light"
                    style={{ padding: "4px", border: "1px solid gray", margin: "2px", cursor: "grab" }}
                >
                    {item.name}
                </div>
            ))}
        </div>
}

export default DragNDropList;