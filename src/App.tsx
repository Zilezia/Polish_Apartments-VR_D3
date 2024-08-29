import { useEffect, useState } from 'react';
import { csv } from 'd3';

import { Polska } from './components/polska/Polska';
// import apartmentData from './data/tables/merged_tables.json'; // this might take ages to load

import './App.css';

export interface apartmentDataType {
  id: string;
  city: string;
  type: string | null;
  squareMeters: number | null;
  rooms: number | null;
  floor: number | null;
  floorCount: number | null;
  buildYear: number | null;
  latitude: number;
  longitude: number;
  centreDistance: number | null;
  poiCount: number | null;
  schoolDistance: number | null;
  clinicDistance: number | null;
  postOfficeDistance: number | null;
  kindergartenDistance: number | null;
  restaurantDistance: number | null;
  collegeDistance: number | null;
  pharmacyDistance: number | null;
  ownership: string | null;
  buildingMaterial: string | null;
  condition: string  | null;
  hasParkingSpace: "yes" | "no" | null;
  hasBalcony: "yes" | "no" | null;
  hasElevator: "yes" | "no" | null;
  hasSecurity: "yes" | "no" | null;
  hasStorageRoom: "yes" | "no" | null;
  price: number;
  date: string
}

function App() {
  useEffect(() => {
    document.title = 'Polish Apartment Prices';
  }, []);
  const [selectedRes, setSelectedRes] = useState<string>('min'); // even on medium its too demanding for me
  
  const [geoData, setGeoData] = useState<any>(null);
  const [apartmentData, setApartmentData] = useState<apartmentDataType[] | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleResChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRes(event.target.value);
  };
  
  useEffect(() => {
    setLoading(true);
    setGeoData(null);
    // setApartmentData(null);
    
    import(`./data/polska/${selectedRes}.ts`)
      .then((module) => {
        setGeoData(module.geoData);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load map");
        setLoading(false);
        console.log("Failed to load map:", err);
      });
    
  }, [selectedRes]);
  
  const apartmentPath = './src/data/apartments/apartments_pl_2023_08-2024_06.csv';

  useEffect(() => {
    csv(apartmentPath, function(d): apartmentDataType {
      return {
        id: d.id,
        city: d.city,
        type: d.type || null,
        squareMeters: d.squareMeters ? +d.squareMeters : null,
        rooms: d.rooms ? +d.rooms : null,
        floor: d.floor ? +d.floor : null,
        floorCount: d.floorCount ? +d.floorCount : null,
        buildYear: d.buildYear ? +d.buildYear : null,
        latitude: +d.latitude,
        longitude: +d.longitude,
        centreDistance: d.centreDistance ? +d.centreDistance : null,
        poiCount: d.poiCount ? +d.poiCount : null,
        schoolDistance: d.schoolDistance ? +d.schoolDistance : null,
        clinicDistance: d.clinicDistance ? +d.clinicDistance : null,
        postOfficeDistance: d.postOfficeDistance ? +d.postOfficeDistance : null,
        kindergartenDistance: d.kindergartenDistance ? +d.kindergartenDistance : null,
        restaurantDistance: d.restaurantDistance ? +d.restaurantDistance : null,
        collegeDistance: d.collegeDistance ? +d.collegeDistance : null,
        pharmacyDistance: d.pharmacyDistance ? +d.pharmacyDistance : null,
        ownership: d.ownership || null,
        buildingMaterial: d.buildingMaterial || null,
        condition: d.condition || null,
        hasParkingSpace: d.hasParkingSpace === "yes" ? "yes" : d.hasParkingSpace === "no" ? "no" : null,
        hasBalcony: d.hasBalcony === "yes" ? "yes" : d.hasBalcony === "no" ? "no" : null,
        hasElevator: d.hasElevator === "yes" ? "yes" : d.hasElevator === "no" ? "no" : null,
        hasSecurity: d.hasSecurity === "yes" ? "yes" : d.hasSecurity === "no" ? "no" : null,
        hasStorageRoom: d.hasStorageRoom === "yes" ? "yes" : d.hasStorageRoom === "no" ? "no" : null,
        price: +d.price,
        date: d.date
      };
    })
      .then((data) => {
        setApartmentData(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError('Error loading the CSV file');
        console.error('Error loading the CSV file:', err);
      });
  }, []);

  return (<>
    <h2 className='page-title'>Polish Apartment Prices <sup>(08/2023 - 06/2024)</sup></h2>
    <div className="map-cont">
      <div 
        className='map-res-cont' 
        title='Recommended to leave as is (on Medium).'
      >
        <label htmlFor="map-res">Map resolution: </label>
        <select name="map-res" id="map-res" onChange={handleResChange} value={selectedRes}>
          <option value="min">Min</option>
          <option value="medium">Medium</option>
          <option value="max">Max</option>
        </select>
      </div>
      {loading && <p className='map-loading'>Loading map...</p>}
      {error && <p className='map-error'>{error}</p>}
      {geoData && apartmentData ? (
        <Polska 
          width={700} height={600} 
          geoData={geoData} plotData={apartmentData} 
        /> 
      ) : (
        !loading && 'No data'
      )}
    </div>
  </>);
}

export default App
  