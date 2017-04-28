import React, { Component, PropTypes } from 'react'; 
import * as d3 from 'd3'; 


function SVGChart({children, width, height}) { 

    return (
        <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
            {children}
        </svg>
    )

}

function ColumnChart({width, height, data, paddingInner, paddingOuter, x, y, handler, columnTooltip, columnColor, axisXLabel, axisColor, axisXLabelShift, numberTicksX, numberTicksY, labelColor, strokeWidth, axisLabelFontSize, axisYLabel, axisYLabelShift, tickLength, tickLabelFontSize}) {

    const bins = data.map((v) => v.bin); 
    const values = data.map((v) => v.value); 
    const maxY = d3.max(data, (v) => v.value); 
    const maxValue = d3.max(data, (v) => v.upper); // upper bound (exclusive) of the most right bin 
        
    const axisScale = d3.scaleLinear()
                        .domain([0, maxValue])
                        .range([0, width])
                        .nice(); // adjustment of the X axis domain 
        
    const maxX = axisScale(maxValue);  // right boundary for the scaleBand range  

    const scaleX = d3.scaleBand()
                    .domain(bins)
                    .range([0, maxX]) 
                    .paddingOuter(paddingOuter)
                    .paddingInner(paddingInner); 

    const scaleY = d3.scaleLinear() 
                    .domain([0, maxY])
                    .range([0, height]); 

    const ticksX = axisScale.ticks(numberTicksX);  
    const ticksY = scaleY.ticks(numberTicksY);        

    //columnTooltip column index for tooltip   
 
    return (
        <g transform={`translate( ${x} , ${y} )`}>
            {data
                .map((v, i) => 
                    <rect 
                        key={`Column_${i}`} 
                        id={i} 
                        x={scaleX(v.bin)} 
                        y={height-scaleY(v.value)} 
                        height={scaleY(v.value)} 
                        onMouseEnter={handler} 
                        onMouseOut={handler} 
                        width={scaleX.bandwidth()} 
                        fill={columnColor}>
                    </rect>
                )
            } 
            <Axis 
                x={axisScale.range()[0]} 
                y={height} 
                axisLength={axisScale.range()[1]-axisScale.range()[0]} 
                type='bottom' 
                label={axisXLabel} 
                stroke={axisColor} 
                labelShift={axisXLabelShift} 
                labelColor={labelColor} 
                strokeWidth={strokeWidth} 
                fontSize={axisLabelFontSize} 
            />
            <Axis 
                x={0} 
                y={height} 
                axisLength={scaleY.range()[1]-scaleY.range()[0]} 
                type='left' 
                label={axisYLabel} 
                stroke={axisColor} 
                labelShift={axisYLabelShift} 
                labelColor={labelColor} 
                strokeWidth={strokeWidth} 
                fontSize={axisLabelFontSize} 
            />                 
            {ticksX
                .map((v, i) => 
                    <Tick 
                        key={`TickX_${i}`} 
                        x={axisScale(+v)} 
                        y={height} 
                        tickLength={tickLength} 
                        type='bottom' 
                        label={v} 
                        stroke={axisColor} 
                        labelColor={labelColor} 
                        strokeWidth={strokeWidth} 
                        fontSize={tickLabelFontSize} 
                    />
                )
            }
            {ticksY
                .map((v, i) => 
                    <Tick 
                        key={`TickY_${i}`} 
                        x={0} 
                        y={height-scaleY(+v)} 
                        tickLength={tickLength} 
                        type='left' 
                        label={v} 
                        stroke={axisColor} 
                        labelColor={labelColor} 
                        strokeWidth={strokeWidth} 
                        fontSize={tickLabelFontSize} 
                    /> 
                )
            }                
        </g>
    )  

} 

function Axis({x, y, type, axisLength, stroke, strokeWidth=1, label='', labelShift=0, labelColor, fontFamily, fontSize=10}) { 

    let lineX = 0, 
        lineY = 0,   
        labelX = 0,  
        labelY = 0,  
        rotation = 0; 
    
    switch (type) {
        case 'left': 
            rotation = 270; 
        case 'top': 
            lineX = axisLength; 
            labelX = lineX; 
            labelY = -labelShift;
            break; 
        case 'right': 
            rotation = 270; 
        case 'bottom': 
            lineX = axisLength; 
            labelX = lineX; 
            labelY = fontSize + labelShift;
            break; 
    }

    return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <line x1={0} y1={0} y2={lineY} x2={lineX} stroke={stroke} strokeWidth={strokeWidth}></line> 
            <text x={labelX} y={labelY} textAnchor={'end'} fill={labelColor} fontFamily={fontFamily} fontSize={fontSize}>{label}</text>
        </g> 
    )

}

function PieChart({innerRadius, outerRadius, centerX, centerY, data, startAngle=0, endAngle=Math.PI * 2, padAngle=0}) {

    const pie = d3.pie()
                .startAngle(startAngle)
                .endAngle(endAngle)
                .padAngle(padAngle)
                .sort(null);  
    
    const arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius); 

    const paths = pie(data.map((v) => v.value)); 

    const fill = data.map((v) => v.fill); 
        
    return (
        <g transform={`translate(${centerX}, ${centerY})`}>
            {paths.map((v, i) => <path key={`Arc_${i}`} d={arc(v)} fill={fill[i]}></path>)}
        </g>
    )

}

function Tick({x=0, y=0, type, tickLength=0, stroke, strokeWidth=1, label='', labelColor, labelShiftX=0, labelShiftY=0, fontFamily, fontSize=10}) {

    let lineX = 0,  
        lineY = 0,   
        labelX = 0,  
        labelY = 0,  
        textAnchor = 'middle'; 

    switch (type) {
        case 'top': 
            lineY = -tickLength; 
            labelY = lineY; 
            break; 
        case 'right': 
            lineX = tickLength; 
            labelX = lineX; 
            labelY = fontSize/2.6; 
            textAnchor = 'start';   
            break; 
        case 'bottom': 
            lineY = tickLength; 
            labelY = lineY + fontSize;
            break; 
        case 'left': 
            lineX = -tickLength;  
            labelX = lineX; 
            labelY = fontSize/2.6;
            textAnchor = 'end';
            break; 
    }

    return ( 
        <g transform={`translate(${x}, ${y})`}> 
            <line x1={0} x2={lineX} y1={0} y2={lineY} stroke={stroke} strokeWidth={strokeWidth}></line> 
            <text x={labelX+labelShiftX} y={labelY+labelShiftY} textAnchor={textAnchor} fill={labelColor} fontFamily={fontFamily} fontSize={fontSize}>{label}</text>
        </g> 
    ) 

} 

function Tooltip({x=0, y=0, label='', labelColor='green', fontFamily='Arial', fontSize=10}) { 

    return (
        <g transform={`translate(${x}, ${y})`}> 
            <text x={0} y={0} textAnchor={'middle'} fill={labelColor} fontFamily={fontFamily} fontSize={fontSize}>{label}</text>
        </g>
    )  

}

export {SVGChart, ColumnChart, PieChart, Tooltip}  
 