const baseurl = 'https://tilerunner.herokuapp.com';

/**
 * Determine how many swaps between two words of equal length, case insensitive.
 * @param {string} word1 A word
 * @param {string} word2 Another word of the same length
 * @returns The number of positions at which the letter is different between the two words, -1 if unequal length words.
 */
 export function countSwaps(word1="", word2="") {
    let result = 0;
    let letters1 = Array.from(word1.toLowerCase());
    let letters2 = Array.from(word2.toLowerCase());
    if (letters1.length === letters2.length) {
        for (let i = 0; i < letters1.length; i++) {
            const l1 = letters1[i];
            if (letters1[i] !== letters2[i]) {
                result++;
            }
        }
    } else {
        result = -1;
    }
    return result;
}

/**
 * Determine whether a word is in the ENABLE2K lexicon, case insensitive
 * @param {string} word A word
 * @returns {Promise<boolean>} Whether the word is in the ENABLE2K lexicon
 * @async
 */
 export async function isWordValid(word) {
    let url = `${baseurl}/ENABLE2K?exists=${word.toLowerCase()}`;
    const response = await fetch(url);
    const jdata = await response.json();
    return jdata.exists;
}
