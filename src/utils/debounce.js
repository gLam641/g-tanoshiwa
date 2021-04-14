let cbTimeout;
let count = 0;

export function debounce(cb, interval) {
    return function (...args) {
        clearTimeout(cbTimeout);
        cbTimeout = setTimeout(() => cb.apply(this, args), interval);
    }
}