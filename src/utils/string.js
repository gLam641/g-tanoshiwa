export function capitalizedWords(s) {
    return s.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}