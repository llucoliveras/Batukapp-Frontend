const AMOUNT = 0.3;

export const lightenColor = (color, amount = AMOUNT) => {
    // Remove "#" if present
    color = color.replace(/^#/, '');

    // Parse the R, G, B components
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    // Parse alpha if present (optional)
    let a = 0; // default fully transparent
    if (color.length === 8) {
        a = parseInt(color.substring(6, 8), 16);
    }

    // Lighten each component toward 255
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);

    // Ensure values stay in range and convert back to hex
    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${color.length === 8 ? toHex(a) : ''}`.toUpperCase();
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

    // Parse RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Parse alpha if present (assume 2 hex digits at the end)
    let a = 255; // default opaque
    if (hex.length === 8) {
        a = parseInt(hex.substr(6, 2), 16);
    }

    // Normalize alpha to 0-1
    const alpha = a / 255;

    // Background assumed white (255, 255, 255)
    const rBlend = Math.round(alpha * r + (1 - alpha) * 255);
    const gBlend = Math.round(alpha * g + (1 - alpha) * 255);
    const bBlend = Math.round(alpha * b + (1 - alpha) * 255);

    // Calculate luminance with blended color
    const luminance = 0.299 * rBlend + 0.587 * gBlend + 0.114 * bBlend;

    // Return black or white text color depending on luminance threshold
    return luminance > 186 ? '#212529' : '#F8F9FA';
};
