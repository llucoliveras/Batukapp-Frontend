const AMOUNT = 0.3;

export const lightenColor = (hex, amount = AMOUNT) => {
    // Remove "#" if present
    hex = hex.replace(/^#/, '');

    // Parse the R, G, B components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    let a = hex.length > 6 ? parseInt(hex.substring(6, 8), 16) : 255;

    // Lighten each component toward 255
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);

    // Ensure values stay in range and convert back to hex
    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`.toUpperCase();
}

export const darkenColor = (hex, amount = AMOUNT) => {
    // Remove # if present
    let color = hex.startsWith('#') ? hex.slice(1) : hex;

    // Parse RGB components
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    // Parse alpha if present (optional)
    let a = 255; // default fully opaque
    if (color.length === 8) {
        a = parseInt(color.substring(6, 8), 16);
    }

    // Decrease each channel by amount, clamp to 0
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));

    // Convert back to hex, pad with zeroes
    const toHex = (x) => x.toString(16).padStart(2, '0');

    // Return 8-char hex only if original had alpha, else 6-char hex
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${color.length === 8 ? toHex(a) : ''}`;
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
