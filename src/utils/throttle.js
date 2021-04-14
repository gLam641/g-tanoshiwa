let enableCall = true;

export function throttle(cb, interval) {
    return function (...args) {
        if (!enableCall) return;

        enableCall = false;
        cb.apply(this, args);
        setTimeout(() => enableCall = true, interval);
    }
}