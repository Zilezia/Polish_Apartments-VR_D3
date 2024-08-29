import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';
import ReactSlider from 'react-slider';

import { apartmentDataType } from '../../App';

import './style/index';

type MapProps = {
  width: number;
  height: number;
  geoData: FeatureCollection;
  plotData: apartmentDataType[];
};

export const Polska = ({ width, height, geoData, plotData }: MapProps) => {
  const [showPlotData, setShowPlotData] = useState(true); // hide everything
  const [selectedCity, setSelectedCity] = useState<string>('All'); // chose one
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // find you
  const [hoveredData, setHoveredData] = useState<apartmentDataType|null>(null); // show you

  const minVal = Math.min(...plotData.map((d) => d.price));
  const maxVal = Math.max(...plotData.map((d) => d.price));
  const [priceRange, setPriceRange] = useState([minVal, maxVal]);
  
  // array of t
  const dateNumRange: { [key: number]: string } = { 
    0:  "2023_08", 
    1:  "2023_09",
    2:  "2023_10",
    3:  "2023_11",
    4:  "2023_12",
    5:  "2024_01",
    6:  "2024_02",
    7:  "2024_03",
    8:  "2024_04",
    9:  "2024_05",
    10: "2024_06"
  };
  const [dateField, setDateField] = useState(0);

  // data filtering
  const filterData = () => { // this just hides everything
    setShowPlotData((prev) => !prev);
  };
    // city
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value || 'All');
  };
    // price range
  const handleRangePrice = (values: number[]) => {
    setPriceRange(values);
  };
    // date
  const handleDateChange = (value: number) => {
    setDateField(value);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef(d3.zoomIdentity);
  
  const projection = d3.geoMercator()
    .scale(3000)
    .translate([-600, 3500])
    .center([1,0]); // problem centering on resizing

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

      const filteredPlotData = plotData
        .filter((d) => d.date === dateNumRange[dateField])
        .filter((d) => selectedCity == 'All' || d.city === selectedCity)
        .filter((d) => d.price >= priceRange[0] && d.price <= priceRange[1]);

      let hovered = null;

      if (showPlotData) {
        filteredPlotData.forEach((d) => {
          const [x, y] = projection([d.longitude, d.latitude]) || [0,0];
          const radius = 5/transform.k;
          const maxPrice = 1_000_000; // actual 2_500_000
          // const minPrice = 150_000;
          const scaled = d.price/maxPrice;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2*Math.PI);
  
          ctx.fillStyle = `rgb(
            ${Math.floor(255 * scaled)}, 
            ${Math.floor(255 * (1 - scaled))},
            0
          )`;
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
    showPlotData, selectedCity, priceRange, // filters
  ]);

  const nf = new Intl.NumberFormat('en-US',{
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const ratePLNUSD = 0.260968;
  const pricePLN = hoveredData?.price ?? 0;
  const priceUSD = hoveredData?.price !== undefined 
    ? hoveredData?.price * ratePLNUSD
    : 0
  ;

  return (<>
    
    <div className='canvas-cont'>
      <canvas className='canvas' ref={canvasRef} width={width} height={height} />
      {/* --------------------------- SIDE --------------------------- */}
      <div className="side-tooltip">
        {/* Price */}
        <div className="side-tt-cont">
          <div className="side-tt-label-row">
            <p className='side-tt-label'>Price:</p>
            {pricePLN ? (
              <p className='side-tt-val'> {nf.format(pricePLN)} zł</p>
            ) : ('')}
          </div>
          {pricePLN ? (
              <p className='side-tt-val' id='usd-price'>(${nf.format(priceUSD)})</p>
            ) : ('')}
        </div>
        
        {/* ----- Has ----- */}
        <div className="side-tt-has-cont">
          <p className='has-stuff-title'>Has</p>
          
          {/* --- Balcony --- */}
          <div className="side-tt-label-row">
            <p className='side-tt-label'>Balcony:</p>
            {hoveredData && (<>
              {hoveredData?.hasBalcony != null ? (
                <p className='side-tt-has-val' id={hoveredData?.hasBalcony+'-val'}>
                  {hoveredData?.hasBalcony}
                </p>
              ):( // if it is null then presume there isnt
                <p className='side-tt-has-val' id='no-val'>no</p>
              )}
            </>)}
          </div>
          {/* Elevator */}
          <div className="side-tt-label-row">
            <p className='side-tt-label'>Elevator:</p>
            {hoveredData && (<>
              {hoveredData?.hasElevator != null ? (
                <p className='side-tt-has-val' id={hoveredData?.hasElevator+'-val'}>
                  {hoveredData?.hasElevator}
                </p>
              ):(
                <p className='side-tt-has-val' id='no-val'>no</p>
              )}
            </>)}
          </div>
          {/* Parking */}
          <div className="side-tt-label-row">
            <p className='side-tt-label'>Parking Space:</p>
            {hoveredData && (<>
              {hoveredData?.hasParkingSpace != null ? (
                <p className='side-tt-has-val' id={hoveredData?.hasParkingSpace+'-val'}>
                  {hoveredData?.hasParkingSpace}
                </p>
              ):(
                <p className='side-tt-has-val' id='no-val'>no</p>
              )}
            </>)}
          </div>
          {/* Security */}
          <div className="side-tt-label-row">
            <p className='side-tt-label'>Security:</p>
            {hoveredData && (<>
              {hoveredData?.hasSecurity != null ? (
                <p className='side-tt-has-val' id={hoveredData?.hasSecurity+'-val'}>
                  {hoveredData?.hasSecurity}
                </p>
              ):(
                <p className='side-tt-has-val' id='no-val'>no</p>
              )}
            </>)}
          </div>
          {/* Storage */}
          <div className="side-tt-label-row">
            <p className='side-tt-label'>Storage Room:</p>
            {hoveredData && (<>
              {hoveredData?.hasStorageRoom != null ? (
                <p className='side-tt-has-val' id={hoveredData?.hasStorageRoom+'-val'}>
                  {hoveredData?.hasStorageRoom}
                </p>
              ):(
                <p className='side-tt-has-val' id='no-val'>no</p>
              )}
            </>)}
          </div>

        </div>
      </div>
      {/* --------------------------- HOVER --------------------------- */}
      {hoveredData && (
        <div className='hover-tooltip'
          style={{
            top: `${(mousePos.y*transformRef.current.k)+transformRef.current.y}px`,
            left: `${(mousePos.x*transformRef.current.k)+transformRef.current.x}px`
          }}
        >
          <div className='hover-tt-cont'>
            <p className='hover-tt-label'>Price:</p>
            <p className='hover-tt-val'>{nf.format(pricePLN)} zł</p>
            <p className='hover-tt-val'>(${nf.format(priceUSD)})</p>
          </div>
        </div>
      )}
    </div>
    {/* some of those are just placed as is icba styling it */}
    <div className="data-filtering">
      <button onClick={() => filterData()}>
        {showPlotData ? 'Hide data' : 'Show data'}
      </button>
      <br/>
      
      <div className="price-range-cont">
        <p className='label-text'>Price:</p>
        <ReactSlider
          onChange={handleRangePrice}
          className="price-slider"
          thumbClassName="price-handle"
          trackClassName="price-track"
          defaultValue={priceRange}
          min={minVal}
          max={maxVal}
          pearling
          minDistance={10_000}
          step={1_000}
        />
      </div>
      <div className="date-range-cont">
        <p className='label-text'>Date:</p>
        <ReactSlider
          onChange={handleDateChange}
          className="date-slider"
          thumbClassName="date-handle"
          trackClassName="date-track"
          defaultValue={0}
          min={0}
          max={8}
          pearling
          // renderThumb={(props, state) => <>
          //   <div {...props}>
          //     <div className="val-bubble">
          //       {numberToStringMap[state.valueNow]}
          //     </div>
          //   </div>
          // </>}
          // renderMark={(props) => <span {...props}/>}
        />
      </div>

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
