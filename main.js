// Layout parameters
var svgWidth = 1200;
var svgHeight = 500;

var padding = { t: 40, r: 40, b: 40, l: 40 };
var cellPadding = 10;

// Compute chart dimensions
var cellWidth = (svgWidth - padding.l - padding.r - 400);
var cellHeight = (svgHeight - padding.t - padding.b);

var cityNames = {
  'CLT': 'Charlotte, North Carolina',
  'CQT': 'Los Angeles, California',
  'IND': 'Indianapolis, Indiana',
  'JAX': 'Jacksonville, Florida',
  'MDW': 'Chicago, Illinois',
  'PHL': 'Philadelphia, Pennsylvania',
  'PHX': 'Pheonix, Arizona',
  'KHOU': 'Houston, Texas',
  'KNYC': 'New York, New York',
  'KSEA': 'Seattle, Washington'
}

// depending on what was selected, display all the cities or just 1 city
function updateCharts(city) {
  city == 'ALL' ? Object.keys(cityNames).forEach((d) => createChart(d)) : createChart(city);
}

// creates a single chart for 1 city
function createChart(city) {

  d3.selectAll('.chart').remove();

  var path = '/weather-data/' + city + '.csv';

  d3.csv(path, dataPreprocessor).then(function (dataset) {

    // create the svg
    var svg = d3.select('#main')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('margin', '10px')
      .attr('class', 'chart');

    // add a title
    svg.append('text')
      .text(cityNames[city])
      .attr('transform', () => 'translate(' + [0, 20] + ')')
      .attr('class', 'city-title');

    // add the summary stats box
    var infoG = svg.append('g')
      .attr('transform', 'translate(' + [cellWidth + padding.l + padding.r + 10, padding.t] + ')');

    infoG.append('rect')
      .attr('width', '400')
      .attr('height', '200')
      .attr('fill', 'gainsboro');

    infoG.append('text')
      .text('Summary:')
      .style('font-size', 'large')
      .attr('transform', 'translate(20, 40)');

    // show default range info for the entire year
    var dateRange = [dataset[0].date, dataset[364].date];
    showInfo(dateRange);

    // function to show the summary stats for the selected date range
    function showInfo(dateRange) {

      // filter to temperatures within the selected date range
      var filteredByDate = dataset.filter((d) => (d.date >= dateRange[0]) & (d.date <= dateRange[1]));

      // calculate the average temperature anomaly in that range
      var rangeTempAnomaly = 0;
      filteredByDate.forEach((d) => rangeTempAnomaly += d.average_temp_anomaly);
      rangeTempAnomaly = Math.round((rangeTempAnomaly / filteredByDate.length) * 100) / 100;

      infoG.append('text')
        .text('Showing Dates: ' + dateRange[0].toDateString() + " to " + dateRange[1].toDateString())
        .attr("transform", "translate(20, 80)")
        .attr('class', 'summary-text');

      infoG.append('text')
        .text("Average Temperature Anomaly in Range: ")
        .attr("transform", "translate(20, 110)")
        .attr('class', 'summary-text');

      infoG.append('text')
        .text(rangeTempAnomaly + "°F")
        .attr("transform", "translate(300, 110)")
        .attr('class', 'summary-text')
        .attr('fill', () => {
          return rangeTempAnomaly > 0 ? "red" : "blue"
        })
        .style('font-weight', 'bold');

      // add the warmest temperature anomaly in range
      var highestTempAnomaly = filteredByDate[0];
      filteredByDate.forEach((d) => {
        highestTempAnomaly = (d.average_temp_anomaly > highestTempAnomaly.average_temp_anomaly) ? d : highestTempAnomaly;
      });

      infoG.append('text')
        .text("Warmest Temperature Anomaly in Range: ")
        .attr("transform", "translate(20, 140)")
        .attr('class', 'summary-text');

      infoG.append('text')
        .text(highestTempAnomaly.average_temp_anomaly + "°F")
        .attr("transform", "translate(300, 140)")
        .attr('class', 'summary-text')
        .attr('fill', () => {
          return highestTempAnomaly.average_temp_anomaly > 0 ? "red" : "blue"
        })
        .style('font-weight', 'bold');

      // add the coldest temperature anomaly in range
      var lowestTempAnomaly = filteredByDate[0];
      filteredByDate.forEach((d) => {
        lowestTempAnomaly = d.average_temp_anomaly < lowestTempAnomaly.average_temp_anomaly ? d : lowestTempAnomaly;
      });

      infoG.append('text')
        .text("Coldest Temperature Anomaly in Range: ")
        .attr("transform", "translate(20, 170)")
        .attr('class', 'summary-text');

      infoG.append('text')
        .text(lowestTempAnomaly.average_temp_anomaly + "°F")
        .attr("transform", "translate(300, 170)")
        .attr('class', 'summary-text')
        .attr('fill', () => {
          return lowestTempAnomaly.average_temp_anomaly > 0 ? "red" : "blue"
        })
        .style('font-weight', 'bold');
    }

    // Create a group element for appending chart elements
    var chartG = svg.append('g')
      .attr('transform', 'translate(' + [padding.l, padding.t] + ')');

    // create the x axis
    var dateDomain = [new Date(2014, 6, 1), new Date(2015, 6)];

    var xScale = d3.scaleTime()
      .domain(dateDomain)
      .range([0, cellWidth]);

    var xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b'));

    chartG.append('g')
      .call(xAxis)
      .attr('transform', function (d) {
        return 'translate(' + [0, cellHeight] + ')';
      });

    chartG.append('text')
      .attr('class', 'label')
      .attr('transform', function () {
        return 'translate(' + [cellWidth / 2, cellHeight + padding.t] + ')';
      })
      .text("Date");

    // create the y axis for temperature
    var tempsDomain = [-35, 35];

    var yScale = d3.scaleLinear()
      .domain(tempsDomain)
      .range([cellHeight, 0]);

    var yAxis = d3.axisLeft(yScale);

    chartG.append('g')
      .call(yAxis);

    chartG.append('text')
      .attr('class', 'label')
      .attr('transform', function () {
        return 'translate(' + [-1 * padding.l, (cellHeight / 2) - padding.t - 30] + ') rotate(90)'
      })
      .text('Temperature Anomaly (°F)');

    // add same y axis for temperature anomaly on the other side
    var yAxis2 = d3.axisRight(yScale);

    chartG.append('g')
      .call(yAxis2)
      .attr('transform', 'translate(' + [cellWidth, 0] + ')');

    // add brush functionality
    var brush = d3.brushX()
      .extent([[0, 0], [cellWidth, cellHeight]])
      .on("end", updateBrushInfo)

    chartG
      .append("g")
      .attr("class", "brush")
      .call(brush);

    // function to update the information in the summary box depending on what the selected date range was
    function updateBrushInfo() {
      extent = d3.event.selection

      // remove all previous
      infoG.selectAll('.summary-text').remove();

      if (!extent) {
        var dateRange = [dataset[0].date, dataset[364].date];
        showInfo(dateRange);
      } else {
        // update info according to days selected with the brush
        var minDate = xScale.invert(extent[0]);
        var maxDate = xScale.invert(extent[1]);
        showInfo([minDate, maxDate]);
      }
    }

    // add the bars for temperature anomaly
    var bars = chartG.append('g')
      .attr('class', 'bars');

    var band = d3.scaleBand()
      .domain(d3.range(dataset.length))
      .range([padding.l, cellWidth - padding.r]);

    // add the positive temperature anomaly bars
    var positives = dataset.filter((d) => {
      return d.average_temp_anomaly > 0;
    })

    var positiveBars = bars.selectAll('.positive-bar')
      .data(positives)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.date))
      .attr('y', (d) => yScale(d.average_temp_anomaly))
      .attr('width', band.bandwidth())
      .attr('height', (d) => yScale(0) - yScale(d.average_temp_anomaly))
      .attr('class', 'positive-bar')
      .attr('fill', 'red');

    // add the negative temperature anomaly bars
    var negatives = dataset.filter((d) => {
      return d.average_temp_anomaly < 0;
    })

    var negativeBars = bars.selectAll('.negative-bar')
      .data(negatives)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.date))
      .attr('y', (d) => yScale(0))
      .attr('width', band.bandwidth())
      .attr('height', (d) => yScale(0) - yScale(-d.average_temp_anomaly))
      .attr('class', 'negative-bar')
      .attr('fill', 'blue');

    // add the line for the y = 0 baseline
    chartG.append("path")
      .attr("stroke", "black")
      .attr('d', d3.line()([[0, cellHeight / 2], [cellWidth, cellHeight / 2]]));

    // add tooltips
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([120, 120]) // offset the tool tip relative to the calculated position
      .html(function (d) {
        var info = "<div>" + "<p><strong>Date:</strong> " + d.date.toDateString() + "</p>"
        info = info + "<p><strong>Temperature Anomaly:</strong> " + d.average_temp_anomaly + " °F</p>";
        info = info + "<p><strong>Average Mean Temperature:</strong> " + d.average_mean_temp + " °F</p>";
        info = info + "<p><strong>Actual Mean Temperature:</strong> " + d.actual_mean_temp + " °F</p>" + "</div>";
        return info;
      }); // sets the content of the tooltip

    // call tooltip to register it in SVG
    chartG.call(toolTip);

    positiveBars.on('mouseover', toolTip.show)
      .on('mouseout', toolTip.hide);
    negativeBars.on('mouseover', toolTip.show)
      .on('mouseout', toolTip.hide);

  });
}

function dataPreprocessor(row) {
  var averageMeanTemp = (parseInt(row['average_max_temp']) + parseInt(row['average_min_temp'])) / 2;
  var avgTempAnomaly = parseInt(row['actual_mean_temp']) - averageMeanTemp;

  // commented out unnecessary variables
  return {
    'date': new Date(row['date']),
    'actual_max_temp': parseInt(row['actual_max_temp']),
    'actual_mean_temp': parseInt(row['actual_mean_temp']),
    'actual_min_temp': parseInt(row['actual_min_temp']),
    // 'actual_precipitation': parseFloat(row['actual_precipitation']),
    'average_max_temp': parseInt(row['average_max_temp']),
    'average_min_temp': parseInt(row['average_min_temp']),
    // 'average_precipitation': parseFloat(row['average_precipitation']),
    // 'record_max_temp': parseInt(row['record_max_temp']),
    // 'record_max_temp_year': parseInt(row['record_max_temp_year']),
    // 'record_min_temp': parseInt(row['record_min_temp']),
    // 'record_min_temp_year': parseInt(row['record_min_temp_year']),
    // 'record_precipitation': parseFloat(row['record_precipitation']),
    'average_mean_temp': averageMeanTemp,
    'average_temp_anomaly': avgTempAnomaly
  };
}

// each time a new city is selected, this updates the charts
function onCategoryChanged() {
  var select = d3.select('#city-select').node();
  var city = select.options[select.selectedIndex].value;
  updateCharts(city);
}

// create default view
updateCharts('ALL');