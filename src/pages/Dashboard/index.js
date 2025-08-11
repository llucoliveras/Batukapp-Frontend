import { useEffect, useRef, useState } from "react";

const Dashboard = ({ savedUserLoginData }) => {
    const containerRef = useRef(null);
    const [layout, setLayout] = useState("grid"); // "grid", "vertical", or "horizontal"

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const MIN_CARD_WIDTH = 250;
        const MIN_CARD_HEIGHT = 150;
        const cardsCount = 4;

        const checkLayout = () => {
            const { width, height } = container.getBoundingClientRect();

            const minCardWidth = 250;
            const minCardHeight = 150;
            const cardsCount = 4;

            // Check if 2x2 grid fits:
            const gridFits = (width >= 2 * minCardWidth) && (height >= 2 * minCardHeight);

            // Check if vertical list fits (all stacked):
            // total min height needed = cardsCount * minCardHeight
            const verticalFits = height >= cardsCount * minCardHeight;

            // Check if horizontal list fits:
            // total min width needed = cardsCount * minCardWidth
            const horizontalFits = width >= cardsCount * minCardWidth;

            if (gridFits) {
                setLayout("grid");
            } else if (!verticalFits && !horizontalFits) {
                setLayout("vertical"); // prioritize vertical if neither fits well
            } else if (!verticalFits) {
                setLayout("horizontal");
            } else {
                setLayout("vertical");
            }
        };

        checkLayout();

        const resizeObserver = new ResizeObserver(() => { checkLayout(); });

        resizeObserver.observe(container);

        return () => { resizeObserver.disconnect(); };
    }, []);

    // Styles for the container depending on layout
    const containerStyles = {
        display: layout === "grid" ? "grid" : "flex",
        flexDirection:
        layout === "vertical" ? "column" : layout === "horizontal" ? "row" : undefined,
        gridTemplateColumns: layout === "grid" ? "1fr 1fr" : undefined,
        gap: "1rem",
        width: "100%",
        height: "100%",
        overflowX: layout === "horizontal" ? "auto" : "hidden",
        overflowY: layout === "vertical" || layout === "grid" ? "auto" : "hidden",
        padding: "1rem",
        boxSizing: "border-box",
    };

    const cardStyle = {
        background: "#eee",
        padding: "1rem",
        borderRadius: "8px",
        minWidth: "250px",
        minHeight: "150px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.25rem",
        flexShrink: 0, // prevent shrinking in horizontal layout
    };

    return (
        <div ref={containerRef} style={containerStyles}>
            <div style={cardStyle}>Events</div>
            <div style={cardStyle}>Notification</div>
            <div style={cardStyle}>Formation</div>
            <div style={cardStyle}>Composer</div>
        </div>
    );
}

export default Dashboard