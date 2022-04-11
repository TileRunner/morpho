import mylogo from './my-logo.svg';
import './App.css';
import './morpho.css';
import './tr.css';
import { useState } from 'react';
import Morpho from './morpho';

function App() {
  const [whereTo, setWhereTo] = useState('home');
  return (
    <div>
      {whereTo === 'home' ?
        <header className="App-header">
          <img src={mylogo} className="App-logo" alt="logo" />
          <div className='App-under-logo'>
            <p>An original word game by Tile Runner</p>
            <p>Swap one letter at a time to get from start to target.</p>
            <button onClick={() => {setWhereTo('game');}}>Play !</button>
          </div>
        </header>
      :
        <header>
          <Morpho setWhereTo={setWhereTo}/>
        </header>
      }
    </div>
  );
}

export default App;
