exports.compareTwoStrings = (str1, str2) => {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    // Simple bigram matching (similar to string-similarity dice coefficient)
    const getBigrams = (str) => {
        const bigrams = new Set();
        for (let i = 0; i < str.length - 1; i++) {
            bigrams.add(str.substring(i, i + 2));
        }
        return bigrams;
    };

    const bg1 = getBigrams(str1);
    const bg2 = getBigrams(str2);

    let intersectionSize = 0;
    for (let bg of bg1) {
        if (bg2.has(bg)) intersectionSize++;
    }

    if (bg1.size + bg2.size === 0) return 0;
    return (2.0 * intersectionSize) / (bg1.size + bg2.size);
};
