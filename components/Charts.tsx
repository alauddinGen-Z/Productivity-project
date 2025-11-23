
import React from 'react';

export const LineChart: React.FC<{
  dataIdeal: number[];
  dataCurrent: number[];
  days: string[];
}> = ({ dataIdeal, dataCurrent, days }) => {
    const height = 150;
    const width = 600;
    const padding = 20;
    const maxVal = Math.max(12, ...dataIdeal, ...dataCurrent); 
    
    const getX = (index: number) => padding + (index * ((width - 2 * padding) / (days.length - 1)));
    const getY = (val: number) => height - padding - (val / maxVal) * (height - 2 * padding);

    const createPath = (data: number[]) => {
      return data.map((val, i) => 
        `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`
      ).join(' ');
    };

    const idealPath = createPath(dataIdeal);
    const currentPath = createPath(dataCurrent);

    return (
      <div className="w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {[0, 0.5, 1].map((t) => (
             <line 
                key={t}
                x1={padding} y1={padding + t * (height - 2 * padding)} 
                x2={width - padding} y2={padding + t * (height - 2 * padding)} 
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" 
             />
          ))}

          <path d={idealPath} fill="none" stroke="#d6d3d1" strokeWidth="2" strokeDasharray="6 4" />
          
          {dataIdeal.map((val, i) => (
            <circle key={`id-${i}`} cx={getX(i)} cy={getY(val)} r="3" fill="#d6d3d1" />
          ))}

          <path d={currentPath} fill="none" stroke="#b45309" strokeWidth="3" className="drop-shadow-sm" />
          
          {dataCurrent.map((val, i) => (
            <circle key={`cu-${i}`} cx={getX(i)} cy={getY(val)} r="4" fill="#b45309" stroke="white" strokeWidth="1.5" />
          ))}

          {days.map((day, i) => (
            <text key={day} x={getX(i)} y={height + 10} textAnchor="middle" fontSize="10" fill="#78716c" fontFamily="sans-serif">
              {day}
            </text>
          ))}
        </svg>
      </div>
    );
};

export const DonutChart: React.FC<{ data: number[] }> = ({ data }) => {
    const size = 160;
    const radius = 60;
    const strokeWidth = 20;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((a, b) => a + b, 0);

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-40 w-40 rounded-full border-4 border-stone-100 text-stone-300 text-xs uppercase tracking-widest">
          No Data
        </div>
      );
    }

    let cumulativeAngle = 0;
    const colors = ['#b45309', '#44403c', '#d6d3d1', '#f5f5f4']; 

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((value, index) => {
          const percentage = value / total;
          const dashArray = percentage * circumference;
          const offset = cumulativeAngle;
          cumulativeAngle += dashArray; 

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={colors[index]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={-offset} 
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
    );
};
