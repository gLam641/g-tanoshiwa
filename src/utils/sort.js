const isDebug = false;

const swapInPlace = (list, i, j) => {
    if (i === j) return;
    list[i] += list[j];
    list[j] = list[i] - list[j];
    list[i] -= list[j];
}

export const COLOR_NETURAL = 'rgb(0, 0, 255)';
const COLOR_STAGED = 'rgb(0, 125, 125)';
const COLOR_COMPARE = 'rgb(255, 255, 0)';
const COLOR_SWAP = 'rgb(0, 255, 0)';

const generateRenderArray = (list, alt_color_profiles = []) => {
    const getColor = (idx) => {
        let color = COLOR_NETURAL;
        alt_color_profiles.forEach((acp) => {
            if (acp.indices.includes(idx)) color = acp.color;
        });
        return color;
    }

    return list.map((v, idx) => {
        return {
            val: v,
            color: getColor(idx),
        }
    });
}

export const bubbleSort = (list, cb) => {
    let isSorted = false;
    if (cb) cb(generateRenderArray(Array.from(list)));
    while (!isSorted) {
        let isSwap = false;
        for (let i = 0; i < list.length - 1; ++i) {
            if (cb) cb(generateRenderArray(Array.from(list), [{ color: COLOR_COMPARE, indices: [i, i + 1] }]));
            if (list[i] > list[i + 1]) {
                swapInPlace(list, i, i + 1);
                isSwap = true;
                if (cb) cb(generateRenderArray(Array.from(list), [{ color: COLOR_SWAP, indices: [i, i + 1] }]));
            }
        }
        if (!isSwap) isSorted = true;
    }
    if (cb) cb(generateRenderArray(Array.from(list)));
}

export const insertionSort = (list, cb) => {
    if (cb) cb(generateRenderArray(Array.from(list)));
    for (let i = 1; i < list.length; ++i) {
        for (let j = 0; j < i; ++j) {
            if (cb) cb(generateRenderArray(Array.from(list), [{ color: COLOR_COMPARE, indices: [i, j] }]));
            if (list[j] > list[i]) {
                swapInPlace(list, j, i);
                if (cb) cb(generateRenderArray(Array.from(list), [{ color: COLOR_SWAP, indices: [i, j] }]));
            }
        }
    }
    if (cb) cb(generateRenderArray(Array.from(list)));
}

export const selectionSort = (list, cb) => {
    if (cb) cb(generateRenderArray(Array.from(list)));
    for (let i = 0; i < list.length; ++i) {
        let smallest = i
        for (let j = i + 1; j < list.length; ++j) {
            if (cb) cb(generateRenderArray(Array.from(list), [{ color: COLOR_COMPARE, indices: [i, smallest, j] }]));
            if (list[smallest] > list[j]) {
                smallest = j;
            }
        }
        if (smallest !== i) {
            swapInPlace(list, i, smallest);
            if (cb) cb(generateRenderArray(Array.from(list), [{ color: COLOR_SWAP, indices: [i, smallest] }]));
        }
    }
    if (cb) cb(generateRenderArray(Array.from(list)));
}

export const mergeSort = (origList, cb) => {
    const currentList = generateRenderArray(Array.from(origList));

    const updateCurrentList = (subList, startIndex, color = COLOR_NETURAL) => {
        // Alternate color scheme. This will allow clearer representation of which sub lists are being combined,
        // but the shades of color are too similar. Works better for large lists.
        // color = 'rgb(0, 0, ' + (255 * subList.length / origList.length)) + ')';

        subList.forEach((v, i) => {
            currentList[i + startIndex] = {
                val: v,
                color
            };
        });
        return Array.from(currentList);
    }

    const mergeSortHelper = (list, startIndex) => {
        if (cb && list.length === origList.length) {
            cb(updateCurrentList(list, startIndex, COLOR_NETURAL));
        }
        if (list.length === 1) return list;
        const mid = Math.floor(list.length / 2);
        const left = mergeSortHelper(list.slice(0, mid), startIndex);
        if (cb) cb(updateCurrentList(left, startIndex, COLOR_STAGED));
        const right = mergeSortHelper(list.slice(mid, list.length), startIndex + mid);
        if (cb) cb(updateCurrentList(right, startIndex + mid, COLOR_STAGED));

        const sortedList = [];
        let leftPtr = 0;
        let rightPtr = 0;

        while (leftPtr < left.length && rightPtr < right.length) {
            if (left[leftPtr] <= right[rightPtr]) {
                sortedList.push(left[leftPtr]);
                leftPtr++;
            } else {
                sortedList.push(right[rightPtr]);
                rightPtr++;
            }
        }

        while (leftPtr < left.length) {
            sortedList.push(left[leftPtr]);
            leftPtr++;
        }

        while (rightPtr < right.length) {
            sortedList.push(right[rightPtr]);
            rightPtr++;
        }

        if (cb) cb(updateCurrentList(sortedList, startIndex, COLOR_SWAP));
        if (cb && sortedList.length === origList.length) {
            cb(updateCurrentList(sortedList, startIndex, COLOR_NETURAL));
        }

        return sortedList;
    }
    return mergeSortHelper(origList, 0);
}

export const quickSort = (list, cb) => {
    // Technically, the algorithm can move the left and right ptr past each other, but this causes no visible change to the
    // rendered array. When this flag is set to true, it skips rendering those steps.
    const isOptimizedRendering = true;

    const quickSortHelper = (left, right) => {
        if (left >= right) return;

        const partition = (left, right, pivot) => {
            let leftPtr = left;
            let rightPtr = right;
            if (cb) cb(generateRenderArray(
                Array.from(list),
                [
                    { color: COLOR_COMPARE, indices: [leftPtr, rightPtr] },
                    { color: COLOR_STAGED, indices: [pivot] },
                ]
            ));

            while (true) {
                while (leftPtr < pivot && list[leftPtr] <= list[pivot]) {
                    leftPtr++;
                    if (cb) {
                        if (isOptimizedRendering && (leftPtr <= rightPtr)) {
                            if (cb) cb(generateRenderArray(
                                Array.from(list),
                                [
                                    { color: COLOR_COMPARE, indices: [leftPtr, rightPtr] },
                                    { color: COLOR_STAGED, indices: [pivot] },
                                ]
                            ));
                        }
                    }
                }
                while (rightPtr > left && list[rightPtr] >= list[pivot]) {
                    rightPtr--;
                    if (cb) {
                        if (isOptimizedRendering && (rightPtr >= leftPtr)) {
                            if (cb) cb(generateRenderArray(
                                Array.from(list),
                                [
                                    { color: COLOR_COMPARE, indices: [leftPtr, rightPtr] },
                                    { color: COLOR_STAGED, indices: [pivot] },
                                ]
                            ));
                        }
                    }
                }
                if (leftPtr >= rightPtr) {
                    break;
                } else {
                    swapInPlace(list, leftPtr, rightPtr);
                    if (cb) cb(generateRenderArray(
                        Array.from(list),
                        [
                            { color: COLOR_SWAP, indices: [leftPtr, rightPtr] },
                            { color: COLOR_STAGED, indices: [pivot] },
                        ]
                    ));
                }
            }

            swapInPlace(list, leftPtr, pivot);
            if (cb) cb(generateRenderArray(Array.from(list), [{ color: COLOR_SWAP, indices: [leftPtr, pivot] }]));
            return leftPtr;
        }

        const pivot = right;
        const mid = partition(left, pivot - 1, pivot);
        quickSortHelper(left, mid - 1);
        quickSortHelper(mid + 1, pivot);
        if (cb && left === 0 && right === list.length - 1) cb(generateRenderArray(Array.from(list)));
    }

    if (cb) cb(generateRenderArray(Array.from(list)));
    quickSortHelper(0, list.length - 1);
}

// test
if (isDebug) {
    const generateListOfNumber = (n, max) => {
        const list_of_numbers = [];
        for (let i = 0; i < n; ++i) {
            list_of_numbers.push(Math.floor(Math.random() * max))
        }
        return list_of_numbers;
    }

    const testSortAlgorithm = (alg, name, lon) => {
        let orig_lon = Array.from(lon);
        const rtnVal = alg(lon);
        if (rtnVal) lon = rtnVal;

        for (let i = 0; i < lon.length - 1; ++i) {
            if (lon[i] > lon[i + 1]) {
                console.log(`Failed | ${name} | (${orig_lon}) -> (${lon})`);
                return false;
            }
        }
        return true;
    }

    const algorithms = [
        { func: bubbleSort, name: 'bubblesort' },
        { func: insertionSort, name: 'insertion sort' },
        { func: selectionSort, name: 'selection sort' },
        { func: mergeSort, name: 'merge sort' },
        { func: quickSort, name: 'quick sort' }
    ];

    const lonArr = [];
    for (let i = 0; i < 100; ++i) {
        const lonSize = Math.floor(Math.random() * 1000) + 1;
        const lon = generateListOfNumber(lonSize, 100);
        lonArr.push(lon);
    }

    algorithms.forEach(alg => {
        const start = Date.now();
        let successCount = 0;
        for (let i = 0; i < lonArr.length; ++i) {
            if (testSortAlgorithm(alg.func, alg.name, Array.from(lonArr[i]))) successCount++;
        }
        console.log(`Success: (${successCount} / ${lonArr.length}) | ${alg.name} | Runtime: ${(Date.now()) - start} ms`);
    });
}