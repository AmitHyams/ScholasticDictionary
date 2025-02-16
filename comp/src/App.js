import logo from './logo.svg';
import { useState, useEffect } from "react";
import './App.css';
import { FaRegTrashCan } from "react-icons/fa6";

function App() {
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [definition, setDefinition] = useState(null);
  const [wData, setWData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [flipped, setFlipped] = useState(false); // Initialize flipped state
  const [flipStyle, setFlipStyle] = useState({ transform: 'rotateY(0deg)' }); // Initial style
  
  useEffect(() => {
    const fetchData = async () => {
      const fetchedArray = await getArray();
      setHistory(fetchedArray);
    };
    fetchData();
  }, []); 

  const saveArray = async (array) => {
    try {
      const jsonValue = JSON.stringify(array);
      localStorage.setItem('wordHistory', jsonValue); // Use localStorage for web
    } catch (e) {
      console.error('Error saving array:', e);
    }
  };

  const getArray = async () => {
    try {
      const jsonValue = localStorage.getItem('wordHistory'); // Use localStorage for web
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading array:', e);
      return [];
    }
  };


  const fetchDefinition = async (w) => {
    if (!w) return;
    setWord(w);
    setLoading(true);
    setError('');
    setDefinition(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w}`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setError('No definitions found.');
        setWData(null);
        setDefinition(null);
        return;
      }

      setWData(data);
      setDefinition(data[0]?.meanings[0]?.definitions[0]?.definition || "No definition available");

      if (!history.includes(w)) {
        const updatedHistory = [...history, w];
        setHistory(updatedHistory);
        saveArray(updatedHistory);
      }
    } catch (err) {
      setError('Error fetching data.');
      console.error(err);
      window.alert(`Error: ${err.message}`);
    }
    setLoading(false);
  };


  const quiz = () => {
    if (history.length === 0) return;
    const randomIndex = Math.floor(Math.random() * history.length);
    setWord(history[randomIndex]);
    fetchDefinition(history[randomIndex]);
  };

  const removeWfromH = (i) => {
    setHistory(history => history.filter(curWord => curWord !== i));
    saveArray(history);
    setWord(null);
    setWData(null);
  };
  
  const flip = () => {
    if (wData != null) {
      setFlipStyle({ transform: flipped ? 'rotateY(0deg)' : 'rotateY(180deg)' });
      setFlipped(!flipped); // Toggle flipped state
    }
  };


  return (
    <div className="container">
      <div onClick={() => { flip() }}>
        <div className="card" style={{ ...flipStyle, transition: 'transform 0.5s' }}>
          <div className="face front">
            <p className="title"> {word} </p>
          </div>
          {flipped && wData && (
            <div className="face back">
              <p className="phon"> {wData[0].phonetic} </p>
              <p placeholder="enter new word"> {wData[0].meanings[0].definitions[0].definition}</p>
              <p> {wData[0].origin} </p>
              <p> {wData[0].meanings[0].definitions[0].example}</p>
            </div>
          )}
          {error ? <p>{error}</p> : null}
        </div>
      </div>

      <div className="word">
        <form onSubmit={(e) => { e.preventDefault(); fetchDefinition(e.target.elements[0].value); console.log("e:",e)}}>
          <input
            placeholder="Enter New Word"
            className="btext"
          />
        </form>
        <button onClick={() => { flipped && flip(); quiz() }} className="used">
          <p className="btext">quiz me!</p>
        </button>
        <p className="btext">Previous Words</p>
        <div className="scroll" id="scrollbar1" style={{ overflowY: 'scroll', maxHeight: '200px' }}>
          {history !== null && history.map((w, index) => (
            <div className="used">
            <div key={index} onClick={() => { flipped && flip(); setWord(history[index]); fetchDefinition(history[index]);}}
              className="usedw">
              <p className="btext">{w}</p>
            </div>
            <div
              onClick={() => {removeWfromH(w);}}
              className="del">
              <p className="btext">remove word</p>
              <FaRegTrashCan />
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
