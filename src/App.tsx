import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './App.css'
import { data } from './data/data';
import { Polska } from './components/Polska';

// took me so long to finally get my previous map into vite react now i can finally rest for the day

function App() {

  return (<>
    <h2>D3 Poland</h2>
    <Polska data={data} width={800} height={600}/> {/* this shit finally works */}
  </>);
}

export default App
