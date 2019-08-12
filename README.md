# d3-choropleth-map
Coded as a part of FCC Data Visualization Projects

1. `topojson.mesh(topology[,object[,filter]])` returns the GeoJSON MultiLineString geometry object representing the mesh for the specified object in the given topology.
    The filter function is called for each arc and takes (a, b) as arguments. a and b are the two geometry objects that share that arc.
    ```js
    // returns mesh of interior boundaries
    var interiors = topojson.mesh(topology, object, function(a, b) { return a !== b; }); 
    ```
    If an arc is only used by a single geometry (i.e. not a border, or an island): a === b.
    Therefore, non-borders or exterior boundaries are excluded from the meshed object.
    
2. You can animate SVG with CSS's animation and @keyframes.
   ```css
   .county:hover {
   fill: rgba(214, 49, 104, 0.3);
   stroke: rgba(214,49,104, 0.5);
   animation: flash 0.5s linear infinite;
   animation-direction: alternate;  
   }

   @keyframes flash {
   0% {
     fill: rgba(214, 49, 104, 0.3);
     stroke: rgba(214,49,104, 0.5);
    }

   100% {
     fill: rgba(214, 49, 104, 0.5);
     stroke: rgba(214,49,104, 0.7);
    }
   }
   ```
3. You need `topojson` library to convert topoJSON into geoJSON to to draw `<path>` onto `<svg>` with `d3.geoPath()`. 
    ```js
    const features = topojson.feature(us, us.objects.counties).features;
    .
    .
    .
     svg.append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(features) // features converted from topojson
    .enter().append('path')
    .attr('class', 'county')
    .attr('data-fips', d => d.id)
    .attr('data-education', (d, i) => matchedFeatures[i][0])
    .attr('fill', (d, i) => colorScale(matchedFeatures[i][0]))
    .attr('d', d3.geoPath()) // path gen function
     ```
 4. `Promise.all` is useful for fetching multiple data. 
    ```js
    Promise.all([d3.json(EDUCATION_FILE), d3.json(COUNTY_FILE)])
    .then(callback);

    function callback(data) {
     // initiate variables
     const [education, us] = data;
     ```
5. If the d3-Selection object is not bound with the data, callbacks inside methods will be passed (undefined, 0) for datum and index.
    ```js
    tooltip
      .style('opacity', .9)
      .attr('data-education', (/* d,i */) => { 
        // IMPORTANT!! Don't pass argument above. 
        // tooltip is NOT data-bound and args will always be [undefined, 0]
        // take args from "on"
        return matchedFeatures[i][0] })  
      .html(`${matchedFeatures[i][2]}, ${matchedFeatures[i][1]}:</br> ${matchedFeatures[i][0]}`)  
      .style('left', (d3.event.pageX) + "px") // must add "px" for position!
      .style('top', (d3.event.pageY - 4.5 * rem) + "px")
    })
    ```
