const container = d3.select('body')
  .append('main')
  .attr("class", "container");

const article = container.append('article');

/* Header */
const header = article.append('header');

header.append('h1')
  .attr('id', 'title')
  .html('United States Educational Attainment');

header.append('p')
  .attr('id', 'description')
  .html(`Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)`)

/* svg */
const rem = 16;
const width = 960, height = 600;

const svg = article.append('svg')
  .attr('width', width)
  .attr('height', height);

/* source */
article.append('div')
  .attr('id', 'source')
  .html(`Source: <a href='https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx'>USDA Economic Research Service</a>`)

/* tooltip */
const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0)
  .style('pointer-events', 'none'); // prevents tooltip from dissapearing when cursor overlaps on top of it




/* svg content */
const EDUCATION_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'; // array
const COUNTY_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'; // obj

Promise.all([d3.json(EDUCATION_FILE), d3.json(COUNTY_FILE)])
  .then(callback);

function callback(data) {
  // initiate variables
  const [education, us] = data;
  const features = topojson.feature(us, us.objects.counties).features;
  console.log(education, us, features);

  /* TODO: data validation(Do converted features object match objects from education data?)
    1. map thru features, find from education arr where id === fibs
    2. if found, map into education's bechelorOrHigher
    3. if not found, map into 0 */
  const matchedFeatures = features.map(f => {
    let matchedFromEducation = education.find(e => e.fips === f.id);
    if (matchedFromEducation) {
      return [matchedFromEducation.bachelorsOrHigher,
        matchedFromEducation.state,
        matchedFromEducation.area_name];
    } else {
      console.log(`missing data from education for topojson id: ${f.id}`)
      return [0, "No data", "No data"];
    }
  })
    
  const minBOH = d3.min(education, o => o.bachelorsOrHigher),
    maxBOH = d3.max(education, o => o.bachelorsOrHigher);
  const legendXStart = 600,
    legendXEnd = 860;
  const colors = d3.schemeYlGn[9];

  // legend scales
  const legendScaleX = d3.scaleLinear()
    .domain([minBOH, maxBOH])
    .rangeRound([legendXStart, legendXEnd]);

  const colorScaleDomainStep = (maxBOH - minBOH) / 8;
  const colorScale = d3.scaleThreshold()
    .domain(d3.range(minBOH, maxBOH, colorScaleDomainStep))
    .range(colors);

  // legend variables  
  const legendMarginTop = 40,
    legendMarginLeft = 0,
    legendHeight = 8,
    legendWidth = legendXEnd - legendXStart,
    legendColWidth = Math.ceil(legendWidth / 8); // prevent gaps b/w cols

  // draw legend  
  const legend = svg.append('g')
    .attr('class', 'key')
    .attr('id', 'legend')
    .attr('transform', `translate(${legendMarginLeft}, ${legendMarginTop})`)

  legend.selectAll('rect')
    .data(colorScale.domain())
    .enter().append('rect')
    .attr('height', legendHeight)
    .attr('x', d => legendScaleX(d))
    .attr('width', legendColWidth)
    .attr('fill', d => colorScale(d));

  // add legend axis
  const legendAxisBottom = d3.axisBottom(legendScaleX)
    .tickSize(13)
    .tickFormat(d => d3.format(".0%")(d/100)) // BOH is already in %
    .tickValues(colorScale.domain())

  legend.call(legendAxisBottom)
    .select('.domain')
    .remove(); // removes axis and outer ticks 
  

    
    // draw US map  
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
    .on('mouseover', (d, i) => {

      // [ area_name, state, bachelorsOrHigher ]
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
    .on('mouseout', d => tooltip.style('opacity', 0));
  
    // draw state borders
    // topojson.mesh returns GeoJSON MultiLineString
    // representing 2nd arg in the given topology(1st arg)  
    // DOTO: understand the filter function (3rd arg)
    svg.append('path')
      .datum(topojson.mesh(us, us.objects.states, (a,b) => a !== b))
      .attr('class', 'states')
      .attr('d', d3.geoPath())
      .attr('fill', 'none')
      .attr('stroke', 'white')
      
}  