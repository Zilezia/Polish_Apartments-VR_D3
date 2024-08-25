import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';

type MapProps = {
  width: number;
  height: number;
  geoData: FeatureCollection;
  plotData: {
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
    hasParkingSpace: "yes" | "no";
    hasBalcony: "yes" | "no" | null;
    hasElevator: "yes" | "no" | null;
    hasSecurity: "yes" | "no" | null;
    hasStorageRoom: "yes" | "no" | null;
    price: number
  }[];
};

export const Polska = ({ width, height, geoData, plotData }: MapProps) => {
  const [showPlotData, setShowPlotData] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformRef = useRef(d3.zoomIdentity);

  const projection = d3.geoMercator()
    .scale(3000)
    .translate([-600, 3500]);

  const filterData = () => {
    setShowPlotData((prev) => !prev);
  };

  // const filterCity = (apCity) => {
  //   setFilteredCity(prev => (prev === apCity ? null : apCity));
  // };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value || 'All');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) {
      return;
    }

    const draw = (transform: d3.ZoomTransform) => {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const geoPathGenerator = d3
        .geoPath()
        .projection(projection)
        .context(ctx); // makes sure its to a canvas not svg
  
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      geoPathGenerator(geoData);
  
      ctx.fillStyle = '#ccc';
      ctx.fill();
  
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.5 / transform.k;
      ctx.stroke();

      const filteredPlotData = 
        selectedCity !== 'All'
        ? plotData.filter((d) => d.city === selectedCity ) 
        : plotData;

      if (showPlotData) {
        filteredPlotData.forEach((d) => {
          const [x, y] = projection([d.longitude, d.latitude]) || [0,0];
          
          ctx.beginPath();
          ctx.arc(x, y, 5/transform.k, 0, 2*Math.PI);
  
          ctx.fillStyle = 'red';
          ctx.fill();
  
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1/transform.k;
          ctx.stroke();
        });
      }
      ctx.restore();
    };
    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.7, 100])
      .translateExtent([[-500, -300], [1300, 1000]])
      .on('zoom', (e: any) => {
          const transform = e.transform;
          transformRef.current = transform;
          draw(transform); // Re-draw the canvas with the new transform
      });
    d3.select(canvas).call(zoom);
    draw(transformRef.current);

  }, [
    canvasRef,
    width, height, 
    projection, geoData, 
    plotData, showPlotData,
    selectedCity
  ]);

  return (<>

    <div className='canvas-container'>
      <canvas ref={canvasRef} width={width} height={height} />
    </div> 
    <br/>
    <div className="tooltip">
      <button onClick={() => filterData()}>
        {showPlotData ? 'Hide data' : 'Show data'}
      </button>
      <br /><br />
      <label htmlFor="city">Choose a city: </label>
      <select name="city" id="city" onChange={handleCityChange} value={selectedCity}>
        <option value="All">All</option>
        <option value="Częstochowa">Częstochowa</option>
        <option value="Gdynia">Gdynia</option>
        <option value="Gdańsk">Gdańsk</option>
        <option value="Szczecin">Szczecin</option>
        <option value="Wrocław">Wrocław</option>
        <option value="Bydgoszcz">Bydgoszcz</option>
        <option value=""></option>
        <option value=""></option>
        <option value=""></option>
        <option value=""></option>
      </select>
      {/* <button onClick={() => filterCity('Częstochowa')}>
        {filteredCity !== 'Częstochowa' ? 'Filter' : 'Unfilter'}
      </button> */}
    </div>
  </>);
};
