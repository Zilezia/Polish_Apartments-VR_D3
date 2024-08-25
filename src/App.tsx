import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';

import { Polska } from './components/Polska';

import './App.css';

// took me so long to finally get my previous map into vite react now i can finally rest for the day

function App() {
  useEffect(() => {
    document.title = 'D3 Poland';
  }, []);
  const [apartmentData, setApartmentData] = useState<any[]>([]);
  const [selectedRes, setSelectedRes] = useState<string>('medium');
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleResChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRes(event.target.value);
  };  
  useEffect(() => {
    setLoading(true);
    setGeoData(null);
    
    import(`./data/polska/${selectedRes}.ts`)
      .then(module => {
        setGeoData(module.geoData);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load map");
        setLoading(false);
        console.log("Failed to load map:", err);
      });
      
      csv('data/tables/data.csv')
        .then(data => {
          setApartmentData(data);
          console.log(data);
        })
        .catch(err => {
          setError("Failed to load apartment data");
          setLoading(false);
          console.log("Failed to load apartment data:", err);
        })
  
  }, [selectedRes]);


  return (<>
    <h2>D3 Poland</h2>
    <div className='map-res-container' title='Recommended to leave as is.'>
      <label htmlFor="map-res">Pick map resolution: </label>
      <select name="map-res" id="map-res" onChange={handleResChange} value={selectedRes}>
        <option value="min">Min</option>
        <option value="medium">Medium</option>
        <option value="max">Max</option>
      </select>

    </div>
    <br />
    {loading && <p className='map-loading'>Loading map...</p>}
    {error && <p className='map-error'>{error}</p>}
    {geoData ? (
      <Polska 
        width={800} height={600} 
        geoData={geoData} plotData={apartmentData} 
      /> 
    ) : (
      !loading && 'No data'
    )}
  </>);
}

export default App
  