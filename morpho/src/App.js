import mylogo from './MorphoButterfly.png';
import mycaterpillar from './MorphoCaterpillar.png';
import mycocoon from './MorphoCocoon.png';
import './App.css';
import './morpho.css';
import './tr.css';
import { useState } from 'react';
import Morpho from './morpho';
import {isMobile} from 'react-device-detect';
import ReactPlayer from 'react-player';

function App() {
  const [whereTo, setWhereTo] = useState('home');
  return (
      whereTo === 'home' ?
        <header>
          <div className="App-header">
            {!isMobile && <img src={mycaterpillar} className="App-logo-small" alt="caterpillar"/>}
            <img src={mylogo} className="App-logo" alt="logo" />
            {!isMobile && <img src={mycocoon} className="App-logo-small" alt="cocoon"/>}
          </div>
          <table>
            <tr>
              <td>
                <ReactPlayer url='https://youtu.be/jEBpZM5CeZ0' width='70%' height='70%'/>
              </td>
              <td>
                <div className='App-under-logo'>
                  <p>An original word game by Tile Runner</p>
                  <p>Swap one letter at a time to morph to target.</p>
                  <button onClick={() => {setWhereTo('game');}}>Play !</button>
                </div>
              </td>
            </tr>
            {/* <tr>
              <td>
                <h3>NWL20 lexicon used with permission from NASPA <a href='https://www.scrabbleplayers.org/landing/tilerunner'>Visit NASPA</a></h3>
              </td>
            </tr> */}
          </table>
        </header>
      :
        <header>
          <Morpho setWhereTo={setWhereTo}/>
        </header>
  );
}

export default App;
