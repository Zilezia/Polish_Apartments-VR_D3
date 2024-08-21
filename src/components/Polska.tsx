import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';

type MapProps = {
  width: number;
  height: number;
  data: FeatureCollection;
};

export const Polska = ({ width, height, data }: MapProps) => {
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
      const geoPathGenerator = d3
        .geoPath()
        .projection(projection)
        .context(context); // if a context is provided, geoPath() understands that we work with canvas, not SVG
  
      context.clearRect(0, 0, width, height);
      context.beginPath();
  
      geoPathGenerator(data);
  
      context.fillStyle = '#ccc';
      context.fill();
  
      context.strokeStyle = 'black';
      context.lineWidth = 0.5;
      context.stroke();
    }, [width, height, projection, data]);

  return (
    <div>
      {/* <svg width={width} height={height}>
        {allSvgPaths}
      </svg> */}
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
