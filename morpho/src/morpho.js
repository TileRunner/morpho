import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { countSwaps, isWordValid } from './word-functions';

const Morpho = ({setWhereTo}) => {
    const lenArray = isMobile ? [3,4,5] : [3,4,5,6,7,8];
    const [guide, setGuide] = useState(false);
    const [starting, setStarting] = useState(true);
    const [numRows, setNumRows] = useState(6);
    const [numCols, setNumCols] = useState(5);
    const [nextNumCols, setNextNumCols] = useState(5);
    const baseurl = (process.env.NODE_ENV === 'production' ? 'https://webappscrabbleclub.azurewebsites.net/api/Values' : 'https://localhost:55557/api/Values');
    const cssPresetLetter = "morphoCellStatic";
    const cssNoLetter = "morphoCellNoLetter";
    const cssSelectedCell = " morphoCellSelected";
    const cssCocoon = "morphoCellCocoon";
    const cssButterfly = "morphoCellButterfly";
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false); // Set when checking solution to prevent further alterations
    const [filledin, setFilledin] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [puzzleSolved, setPuzzleSolved] = useState(false);
    const [firstWord, setFirstWord] = useState('');
    const [lastWord, setLastWord] = useState('');
    const [board, setBoard] = useState([]);
    const [selected, setSelected] = useState({row:1}); // Natural start row

    const callForPuzzle = async(wordLength) => {
        let data = {};
        try {
            let url = `${baseurl}/morpho?rows=${wordLength+1}&cols=${wordLength}`;
            const response = await fetch(url);
            let json = await response.json();
            if (json.value.fail) {
                data.notes = ['The cat had a hairball!', json.value.fail];
            } else {
                data.puzzle = json.value;
            }
        } catch (error) {
            data.notes = "The cat escaped. Sorry about that.";
            console.log(error);
        }
        return data;
    }
    const setInitialBoard = async(wordLength) => { // Initial board of given size
        setStarting(false);
        setLoading(true);
        setChecking(false);
        setShowSolution(false);
        setFilledin(false);
        setPuzzleSolved(false);
        let rowArray = [];
        const data = await callForPuzzle(wordLength);
        if (!data.notes || data.notes.length === 0) { // Ok result
            let numberOfRows = data.puzzle.numRows;
            let numberOfCols = data.puzzle.numCols;
            for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
                const rowWord = data.puzzle.rows[rowIndex].letters.toUpperCase();
                if (rowIndex === 0) {
                    setFirstWord(rowWord);
                } else if (rowIndex === numberOfRows - 1) {
                    setLastWord(rowWord);
                }
                const rowLetters = [...Array.from(rowWord)];
                let rowFilledIn = rowIndex === 0 || rowIndex === numberOfRows - 1;
                let colArray = [];
                for (let colIndex = 0; colIndex < numberOfCols; colIndex++) {
                    let cell = {letter:'?',solution:rowLetters[colIndex],className:'?'};
                    if (rowIndex === 0 || rowIndex === numberOfRows - 1) {
                        cell.letter = rowLetters[colIndex];
                        cell.className = cssPresetLetter;
                    } else {
                        cell.letter = '?';
                        cell.className = cssNoLetter;
                    }
                    colArray.push(cell);
                }
                rowArray.push({filledin:rowFilledIn, colArray:colArray});
            }
            setNumCols(numberOfCols);
            setNumRows(numberOfRows);
            setBoard(rowArray);
            setSelected({row:1});
            setLoading(false);
        } else {
            alert(`Problem generating puzzle: ${data.notes.join(' ... ')}\nBest to click Home then retry.`);
        }
    }

    const handleSelection = (rowIndex, colIndex) => {
        if (checking) {
            return; // No moves while checking solution
        }
        if (puzzleSolved) {
            return; // Puzzle already solved
        }
        if (colIndex < 0 || colIndex >= numCols) { // I don't think this can happen
            return;
        }
        if (rowIndex === numRows - 1 && selected.row > 0 && selected.row < numRows - 1) {
            // If they click on a bottom row tile then copy it up and copy down the rest of the row
            let newBoard = JSON.parse(JSON.stringify(board));
            for (let ci = 0; ci < numCols; ci++) {
                if (ci === colIndex) {
                    // This is the column they clicked on
                    newBoard[selected.row].colArray[ci].letter = newBoard[numRows-1].colArray[ci].letter;
                } else {
                    newBoard[selected.row].colArray[ci].letter = newBoard[selected.row - 1].colArray[ci].letter;
                }
                newBoard[selected.row].colArray[ci].className = cssCocoon;               
            }
            newBoard[selected.row].filledin = true;
            let newSelected = {row: selected.row + 1};
            if (newSelected.row >= numRows - 1) {
                newSelected.row = 1;
            }
            setSelected(newSelected);
            setBoard(newBoard);
            if (newBoard.filter(r => {return !r.filledin;}).length === 0) {
                // All letters are filled in
                setFilledin(true);
            }
            return;
        }
        if (rowIndex < 1 || rowIndex >= numRows - 1) { // I don't think this can happen
            return;
        }
        setSelected({row:rowIndex});
    }

    const toggleShowSolution = () => {
        setShowSolution(!showSolution);
    }

    const checkSolution = async() => {
        setChecking(true);
        let result = true;
        for(let rowIndex = 1; result && rowIndex < numRows; rowIndex++) {
            let prevWord = "";
            let currWord = "";
            for (let colIndex = 0; colIndex < numCols; colIndex++) {
                prevWord = prevWord + board[rowIndex-1].colArray[colIndex].letter;
                currWord = currWord + board[rowIndex].colArray[colIndex].letter;
            }
            if (countSwaps(prevWord, currWord) !== 1) {
                alert(`${prevWord} to ${currWord} is not a valid move`);
                result = false;
            }
            if (result && rowIndex !== numRows -1 && ! await isWordValid(currWord)) {
                alert(`${currWord} is not valid`);
                result = false;
            }
        }
        setChecking(false);
        setPuzzleSolved(result);
    }

    const promptForPuzzleGeneration = <div className='gameStartDiv'>
        {lenArray.map((l) => (
            <button className={`${l === nextNumCols ? 'lenSelected' : 'lenUnselected'}`} key={`selLen${l}`}
            onClick={() => {setNextNumCols(l);}}>{l}</button>
        ))}
        <div>
            <button className="trButton" onClick={() => {setInitialBoard(nextNumCols);}}>
                START PUZZLE
            </button>
            {nextNumCols > 7 && <p className='trWarning'>The cat gets hairballs on large puzzles</p>}
        </div>
    </div>;

    const showGuide = <ul className='guide'>
        <li>Change one letter at a time to get from {firstWord} to {lastWord}.</li>
        <li>Each interim word must be a valid word.</li>
        <li>Click a letter on the bottom row to use it as the swap on the selected row.</li>
    </ul>;

    const renderThePuzzle = <div key="showboard" className={puzzleSolved ? `morphoSolvedDiv l${numCols}` : "morphoDiv"}>
        <table><tbody>
            {board.map((boardRow, rowIndex) => (
                <tr key={`BoardRow.${rowIndex}`}>
                    {boardRow.colArray.map((cell, colIndex) => (
                        <td key={`BoardCell.${rowIndex}.${colIndex}`}
                            onClick={() => { handleSelection(rowIndex, colIndex); } }
                            className={`col morphoCell ${showSolution ? cssPresetLetter : puzzleSolved ? cssButterfly : cell.className + (rowIndex === selected.row ? cssSelectedCell : "")}`}>
                            {showSolution ?
                                <span key={`BoardCellS.${rowIndex}.${colIndex}`}>{cell.solution}</span>
                                :
                                <span key={`BoardCellL.${rowIndex}.${colIndex}`}>{cell.letter}</span>}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody></table>
        <div className="trParagraph">
            {!loading && !checking && !puzzleSolved && filledin && <div className='trParagraph'>
                <button className="trButton" onClick={() => { checkSolution(); } }>
                    SUBMIT SOLUTION
                </button>
            </div>}
            {puzzleSolved ?
                promptForPuzzleGeneration
                :
                <div className='trParagraph'>
                    <button className="trButton" onClick={() => { toggleShowSolution(); } }>
                        {`${showSolution ? 'HIDE SOLUTION' : 'SHOW A SOLUTION'}`}
                    </button>
                </div>}
        </div>
    </div>;

    return (
        <div className="trBackground">
            <div className='toprow'>
                <button className="trButton" onClick={() => {setWhereTo('home');}}>
                    <i className="material-icons" data-toggle="tooltip" title="Home">home</i>
                </button>
                {!loading && !checking && !puzzleSolved &&
                    <button className='trButton' onClick={() => {setGuide(!guide);}}>
                        {guide ? 'Hide guide' : 'Show guide'}
                    </button>}
            </div>
            {!loading && !checking && !puzzleSolved && guide && showGuide}
            {starting ?
                promptForPuzzleGeneration
            :
            loading ?
                <div key="pleasewait" className="trEmphasis">Feeding the cat, hang on...</div>
            :
                renderThePuzzle
            }
        </div>
    )
}

export default Morpho;