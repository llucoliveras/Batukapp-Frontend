export const lightenHex = (hex, factor = 0.3) => {
    // Remove "#" if present
    hex = hex.replace(/^#/, '');

    // Parse the R, G, B components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Lighten each component toward 255
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);

    // Ensure values stay in range and convert back to hex
    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export const getTextColorForBackground = (hex) => {
    // Remove "#" if present
    hex = hex.replace(/^#/, '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance (formula from W3C)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Return black or white depending on luminance
    return luminance > 186 ? '#212529' : '#F8F9FA';
}
