import './App.css'

import { polskaMin } from './data/polskaD';
import { apartmentData } from './data/apartmentD'; // no clue if with this it takes longer to load the page

import { Polska } from './components/Polska';

// took me so long to finally get my previous map into vite react now i can finally rest for the day

function App() {



  return (<>
    <h2>D3 Poland</h2>
    <Polska width={800} height={600}
      geoData={polskaMin}
      plotData={apartmentData}
    /> {/* this shit finally works */}

  </>);
}

export default App
  