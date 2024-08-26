import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';
import ReactSlider from 'react-slider';

import './style/index';

// bunch of nulls 
interface apartmentDataType {
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
  price?: number
}

type MapProps = {
  width: number;
  height: number;
  geoData: FeatureCollection;
  plotData: apartmentDataType[];
};

export const Polska = ({ width, height, geoData, plotData }: MapProps) => {
  const [showPlotData, setShowPlotData] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredData, setHoveredData] = useState<apartmentDataType|null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef(d3.zoomIdentity);
  
  const projection = d3.geoMercator()
    .scale(3000)
    .translate([-600, 3500]);


  const filterData = () => {
    setShowPlotData((prev) => !prev);
  };
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value || 'All');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx ) {
      return;
    }
    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.7, 100])
      .translateExtent([[-500, -300], [1300, 1000]])
      .on('zoom', (e: any) => {
          const transform = e.transform;
          transformRef.current = transform;
          draw(transform); // Re-draw the canvas with the new transform
      });
    d3.select(canvas).call(zoom);
    
    const rect = canvas.getBoundingClientRect();
    const handleMouseMove = (e: any) => {
      const transform = transformRef.current;
      const mouseX = (e.clientX-rect.left-transform.x)/transform.k;
      const mouseY = (e.clientY-rect.top-transform.y)/transform.k;
      setMousePos({ x: mouseX, y: mouseY });
    };
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

      let hovered = null;

      if (showPlotData) {
        filteredPlotData.forEach((d) => {
          const [x, y] = projection([d.longitude, d.latitude]) || [0,0];
          const radius = 5/transform.k;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2*Math.PI);
  
          ctx.fillStyle = 'red';
          ctx.fill();
  
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1/transform.k;
          ctx.stroke();

          if (
            mousePos.x > x-radius && 
            mousePos.x < x+radius &&
            mousePos.y > y-radius && 
            mousePos.y < y+radius
          ) {
            hovered = d;
          }
        });
      }
      setHoveredData(hovered);
      ctx.restore();
    };
    
    draw(transformRef.current);
    canvas.addEventListener('mousemove', handleMouseMove);

  }, [
    width, height, projection, // canvas stuff
    mousePos,// mouse
    geoData, plotData, // data
    showPlotData, selectedCity, // filters
  ]);

  const nf = new Intl.NumberFormat('en-US',{
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const maxVal = 100;
  const minVal = 0;
  
  const ratePLNUSD = 0.260968;
  const pricePLN = hoveredData?.price ?? 0;
  const priceUSD = hoveredData?.price !== undefined 
    ? hoveredData?.price * ratePLNUSD
    : 0
  ;

  return (<>

    <div className='canvas-cont'>
      <canvas className='canvas' ref={canvasRef} width={width} height={height} />
      <div className="side-tooltip">
        
        <p className='side-tt tt-attr-label'>Price:</p>
        {pricePLN 
          ? <>
            <p className='side-tt tt-attr-val' id='pln-price'>{nf.format(pricePLN)} zł</p>
            <p className='side-tt tt-attr-val' id='usd-price'>(${nf.format(priceUSD)})</p>
          </>
          :''
        }
      </div>
      {hoveredData && (
        <div className='hov-tooltip'
          style={{
            top: `${(mousePos.y*transformRef.current.k)+transformRef.current.y}px`,
            left: `${(mousePos.x*transformRef.current.k)+transformRef.current.x}px`
          }}
        >
          <div className='tt-attr-container'>
            <p className='hover-tt tt-attr-label'>Price:</p>
            <p className='hover-tt tt-attr-val' id='pln-price'>{nf.format(pricePLN)} zł</p>
            <p className='hover-tt tt-attr-val' id='usd-price'>(${nf.format(priceUSD)})</p>
          </div>
        </div>
      )}
    </div>

  
    <div className="data-filtering">
      <ReactSlider
          className="horizontal-slider"
          thumbClassName="price-handle"
          trackClassName="price-track"
          defaultValue={[minVal, maxVal]}
          min={minVal}
          max={maxVal}
          ariaLabel={['Lower thumb', 'Upper thumb']}
          // ariaValuetext={state => `Price value: ${state.valueNow}`}
          // renderThumb={(props, state) => (
          //   <div {...props}>{state.valueNow}</div>
          // )}
          pearling
          minDistance={5}
      />

      <button onClick={() => filterData()}>
        {showPlotData ? 'Hide data' : 'Show data'}
      </button>

      {/* cba having this dynamic */}
      <label htmlFor="city">Choose a city: </label>
      <select name="city" id="city" onChange={handleCityChange} value={selectedCity}>
        <option value="All">All</option>
        <option value="Gdynia">Gdynia</option>
        <option value="Gdańsk">Gdańsk</option>
        <option value="Szczecin">Szczecin</option>
        <option value="Białystok">Białystok</option>
        <option value="Bydgoszcz">Bydgoszcz</option>
        <option value="Poznań">Poznań</option>
        <option value="Warszawa">Warszawa</option>
        <option value="Łódź">Łódź</option>
        <option value="Radom">Radom</option>
        <option value="Lublin">Lublin</option>
        <option value="Wrocław">Wrocław</option>
        <option value="Częstochowa">Częstochowa</option>
        <option value="Katowice">Katowice</option>
        <option value="Kraków">Kraków</option>
        <option value="Rzeszów">Rzeszów</option>
      </select>
      {/* <button onClick={() => filterCity('Częstochowa')}>
        {filteredCity !== 'Częstochowa' ? 'Filter' : 'Unfilter'}
      </button> */}
    </div>
  </>);
};
