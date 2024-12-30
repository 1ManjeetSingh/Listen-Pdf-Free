import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import pdfToText from 'react-pdftotext'
import './App.css'

function App() {

  const [utterance, setUtterance] = useState(null);
  const [pdftotext, setPdftotext] = useState();
  const [content, setContent] = useState();
  const [play, setPlay] = useState(false);
  const [voice, setVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);


  function extractText(event) {
    const file = event.target.files[0]
    pdfToText(file)
      .then(text => setPdftotext(text))
      .catch(error => console.error("Failed to extract text from pdf"))
  }

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(pdftotext);
    const voices = synth.getVoices();

    setUtterance(u);
    setVoice(voices[4]);

    setCurrentWordIndex(0);

    u.onboundary = (event) => {
      const textBefore = pdftotext.substring(0, event.charIndex);
      const wordsBefore = textBefore.split(/\s+/).length;
      setCurrentWordIndex(wordsBefore - 1);
    };
    u.onend = () => {
      setPlay(false);  // Reset play state
      setCurrentWordIndex(0);  // Reset highlighting
    };

    return () => {
      synth.cancel();
    };
  }, [pdftotext]);

  function toggleplay() {
    const synth = window.speechSynthesis;
    setPlay(!play);

    if (play) {
      synth.pause();
    }
    else {
      synth.resume();
    }

    utterance.voice = voice;
    utterance.rate = rate;
    synth.speak(utterance);
  }

  function handleText() {
    setPdftotext(null);
    setPlay(false);
  }

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();

    setPlay(false);
  };

  const handleVoiceChange = (event) => {
    const voices = window.speechSynthesis.getVoices();
    setVoice(voices.find((v) => v.name === event.target.value));
  };

  const handleRateChange = (event) => {
    setRate(parseFloat(event.target.value));
  };

  // Highlight current word being spoken
  const getHighlightedText = () => {
    const words = pdftotext.split(/\s+/);
    const highlightedText = words
      .map((word, index) => {
        return index === currentWordIndex
          ? `<span class="bg-blue-300">${word}</span>`
          : word;
      })
      .join(" ");  // Join words with a space to avoid line breaks
  
    return (
      <span
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
    );
  };

  return (
    <div className='w-full min-h-screen'>
      <div className='flex flex-col justify-center items-center gap-8 my-4'>
        <h1>Read PDF</h1>
        <div className='flex flex-wrap h-fit w-fit bg-none outline-none gap-8 py-6'>
          <div className='flex mx-auto gap-8'>
            {play ? <button onClick={toggleplay} ><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" /></svg></button>
              : <button disabled={pdftotext == null} onClick={toggleplay} ><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" /></svg></button>}
            <button onClick={handleStop}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 384 512"><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" /></svg></button>
          </div>
          <label className='flex flex-col mx-auto'>
            Voice:
            <select className='border border-black rounded-lg p-1' value={voice?.name} onChange={handleVoiceChange}>
              {window.speechSynthesis.getVoices().map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </label>
          <label className='flex flex-col mx-auto'>
            Speed:
            <input
              className='my-auto'
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
            />
          </label>
        </div>
      </div>
      <div className='px-2 py-4 mb-4 flex justify-center items-start border border-black relative max-h-[700px] overflow-auto'>
        {pdftotext ?
          (
            <div className='flex flex-wrap text-md lg:text-lg w-[90%] sm:w-[80%] leading-relaxed'>
              <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4 sm:w-5 sm:h-5 absolute top-2 right-2 sm:top-5 sm:right-5' onClick={handleText} viewBox="0 0 384 512"><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" /></svg>
              {getHighlightedText()}
            </div>
          )
          : (<div className='flex flex-col gap-8'>
            <input className='border border-gray' type="file" accept="application/pdf" onChange={extractText} />
            <h2>OR</h2>
            <textarea
              type="text"
              data-gramm="false"
              className="border border-gray-300 rounded p-2"
              rows="5"
              placeholder='paste your content here...'
              onChange={(e) => setContent(e.target.value)}
              readOnly={false}
            />
            <button
              className="w-fit bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => setPdftotext(content)}
            >
              Upload
            </button>
          </div>)}
      </div>
    </div>
  )
}

export default App
