export function throttle(cb, interval) {
    let enableCall = true;

    return function (...args) {
        if (!enableCall) return;

        enableCall = false;
        cb.apply(this, args);
        setTimeout(() => enableCall = true, interval);
    }
}