import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';

import { Apartment } from '../data/apartmentD'; //

type MapProps = {
  width: number;
  height: number;
  geoData: FeatureCollection;
  plotData: Apartment[];
};

export const Polska = ({ width, height, geoData, plotData }: MapProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const projection = d3.geoMercator()
        .scale(3000)
        .translate([-600, 3500]);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      
      if (!context) {
        return;
      }

      const draw = (transform: d3.ZoomTransform) => {
        context.save();
        
        context.clearRect(0, 0, width, height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);

        context.beginPath();

        const geoPathGenerator = d3
          .geoPath()
          .projection(projection)
          .context(context); // makes sure its to a canvas not svg
    
        context.clearRect(0, 0, width, height);
        context.beginPath();
    
        geoPathGenerator(geoData);
    
        context.fillStyle = '#ccc';
        context.fill();
    
        context.strokeStyle = 'black';
        context.lineWidth = 0.5 / transform.k;
        context.stroke();
  
        plotData.forEach((d) => {
          const [x, y] = projection([d.longitude, d.latitude]) || [0,0];
  
          context.beginPath();
          context.arc(x, y, 5 / transform.k, 0, 2 * Math.PI);
          
          context.fillStyle = 'red';
          context.fill();
  
          context.strokeStyle = 'black';
          context.lineWidth = 1 / transform.k;
          context.stroke();
        });

        context.restore();
      };

      const zoom = d3.zoom()
        .scaleExtent([0.7, 100])
        .translateExtent([[-500, -300], [1300, 1000]])
        .on('zoom', (event) => {
            const transform = event.transform;
            draw(transform); // Re-draw the canvas with the new transform
        });
      d3.select(canvas).call(zoom);
      draw(d3.zoomIdentity);
    }, [width, height, projection, geoData, plotData]);

    const filterData = () => {
      return;
    }

  return (<>
    <div className='canvas-container'>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
    <div className="tooltip">
      <button onClick={filterData}>Filter</button>
    </div>
  </>);
};
