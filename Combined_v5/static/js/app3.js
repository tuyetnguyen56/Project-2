// console.log("test");

var zipcode = 92109;

var chartData = {};


  // populate drop-down
  d3.select("#dropdown")
  .selectAll("option")
  .data(dropdown_options)
  .enter()
  .append("option")
  .attr("value", function (option) { return option.value; })
  .text(function (option) { return option.text; });
  
  // initial dataset on load
  var selected_dataset = "income";
  
  var myMap = L.map("block", {
  center: [32.7157, -117.1611],
  zoom: 12,
  maxBounds: L.latLngBounds([90, -180], [-90, 180]),
  maxBoundsViscosity: 1
  // layers: [grayscalemap]
  });
  
  var grayscalemap = L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  }).addTo(myMap);

function mapPan(zipcode){
  var zip_url = `/zipcodes/${zipcode}`;

  // console.log(zip_url);

  d3.json(zip_url).then(function (response) {

    var lat = response.lat;
    var lon = response.lon;
    myMap.setView(new L.LatLng(lat, lon), 13);

    // console.log('map panned');
  })

  
}

function createTable(zipcode) {

  // Select body of table
  // var table = d3.select("tbody")
  var table = d3.select("#stats_table")

  // Loop through each sighting in matching data
  var zip_url = `/zipcodes/${zipcode}`;

  d3.json(zip_url).then(function (response) {

    // Remove rows from table
    d3.selectAll(".MyClass").remove();

    Object.entries(response).forEach(function (stat) {

      var name = stat[0];
      var value = stat[1];

      switch (name) {
        case 'city500_closest_name':
          name = 'Closest city with 500k people'
          break;
        case 'cost_of_living':
          name = 'Cost of home ownership'
          break;
        case 'crime':
          name = 'Crime'
          break;
        case 'education':
          name = 'Pct of Daytime population with Bachelor\'s Degree';
          value = parseFloat(value * 100).toFixed(2) + "%"
          break;
        case 'income':
          name = 'Income';
          value = `$${(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
          break;
        case 'jan_avg_temp':
          name = 'Average temperature in January (F)'
          break;
        case 'name':
          name = 'City Name'
          break;
        case 'zipcode':
          name = 'Zipcode'
          break;
        default:

      }


      // Append new row to table
      new_row = table.append('tr');
      // new_row.append('td').text(name);
      // new_row.append('td').text(value);
      new_row.append('td').text(name).classed("MyClass", true);
      new_row.append('td').text(value).classed("MyClass", true);
    })



  })

}

// Code snippet to update zipcode
function createRadar(zipcode) {

  d3.json(`/zipcodes/${zipcode}`).then(function (response) {

    // Likely unnecessarily long piece of code to create & remove divs to update chart
    var radar_area = d3.select('#radar_plot');

    var dummy = [];

    radar_area.selectAll('div')
      .data(dummy)
      .exit()
      .remove();

    dummy = [1];

    radar_area.selectAll('div')
      .data(dummy)
      .enter()
      .append('div')
      .attr("id", 'chart_area')
      .attr("width", "500px")
      .attr("height", '500px')

    zip_info = response;

    // console.log('Zip Stats:')
    // console.log(response);

    d3.json('/averages').then(function (reply) {

      state_avg = reply;

      // console.log('State Avg:')
      // console.log(reply);


      // anychart.onDocumentReady(function () {
      //   // create data set on our data

      //   chartData = {
      //     title: '',
      //     header: ['#', `${zipcode} / CA Avg`,'CA Avg','Dummy'],
      //     rows: [
      //         ['Income',  zip_info.income/state_avg.income,1,1],
      //         ['Education',  zip_info.education/state_avg.education,1,1],
      //         ['Crime', zip_info.crime/state_avg.crime,1,1],
      //         ['Avg Jan Temperature (F)',  zip_info.jan_avg_temp/state_avg.jan_avg_temp,1,1],
      //         ['Cost of Living', zip_info.cost_of_living/state_avg.cost_of_living,1,1]
      //     ]
      // };

      //   console.log(chartData);

      //   // create radar chart
      //   var chart = anychart.radar();

      //   // set default series type
      //   chart.defaultSeriesType('area');

      //   // set chart data
      //   chart.data(chartData);

      //   console.log(chart);

      //   // force chart to stack values by Y scale.
      //   chart.yScale().stackMode('value');

      //   // set yAxis settings
      //   chart.yAxis().stroke('#545f69');
      //   chart.yAxis().ticks().stroke('#545f69');

      //   // set yAxis labels settings
      //   chart.yAxis().labels()
      //           .fontColor('#545f69')
      //           .format('{%Value}{scale:(1000000)|(M)}');

      //   // set chart legend settings
      //   chart.legend()
      //           .align('center')
      //           .position('center-bottom')
      //           .enabled(true);

      //   chart.container('');
      //   // set container id for the chart
      //   chart.container('chart_area');
      //   // initiate chart drawing
      //   chart.draw(); 
      // })

      anychart.onDocumentReady(function () {
        // create data set on our data
        var dataSet = anychart.data.set([
          ['Income', zip_info.income / state_avg.income, 1],
          ['Education', zip_info.education / state_avg.education, 1],
          ['Crime', zip_info.crime / state_avg.crime, 1],
          ['Avg Jan Temperature (F)', zip_info.jan_avg_temp / state_avg.jan_avg_temp, 1],
          ['Cost of Living', zip_info.cost_of_living / state_avg.cost_of_living, 1]
        ]);

        // console.log("Chart Data:");
        // console.log(dataSet);

        // map data for the first series, take x from the zero column and value from the first column of data set
        var data1 = dataSet.mapAs({ 'x': 0, 'value': 1 });
        // map data for the second series, take x from the zero column and value from the second column of data set
        var data2 = dataSet.mapAs({ 'x': 0, 'value': 2 });
        // map data for the third series, take x from the zero column and value from the third column of data set
        // var data3 = dataSet.mapAs({'x': 0, 'value': 3});

        // create radar chart
        var chart = anychart.radar();

        // set chart title text settings
        chart.title('Zip Code Stats vs Average CA Zipcode');

        // set chart yScale settings
        chart.yScale()
          .minimum(0)
          .maximumGap(0)
          .ticks().interval(5);

        // set xAxis labels settings
        chart.xAxis().labels().padding(5);

        // set chart legend settings
        chart.legend()
          .align('center')
          .enabled(true);

        // create first series with mapped data
        var series1 = chart.line(data1).name(`${zipcode} / CA Avg`);
        series1.markers()
          .enabled(true)
          .type('circle')
          .size(3);
        // create first series with mapped data
        var series2 = chart.line(data2).name('CA Avg');
        series2.markers()
          .enabled(true)
          .type('circle')
          .size(3);
        // create first series with mapped data
        // var series3 = chart.line(data3).name('Dummy');
        // series3.markers()
        //         .enabled(true)
        //         .type('circle')
        //         .size(3);

        // chart tooltip format
        chart.tooltip().format('Value: {%Value}');

        // set container id for the chart
        chart.container('chart_area');
        chart.draw();
      });



    })
  });
};

function optionChanged(variable) {

  if (variable == 'Cost of Living') {
    variable = 'cost'
  };

   /* start */
   var dropdown_options;

   switch (variable) {
     case 'Income':
       dropdown_options = 'income'
       break;
     case 'Crime':
       dropdown_options = 'crime'
       break;
     case 'Education':
       dropdown_options = 'education'
       break;
     case 'Climate':
       dropdown_options = 'winter_temp';
       break;
     case 'Cost of Living':
       dropdown_options = 'cost_of_living';
     default:
   }
 
   var geoAPI = '/geojson';
 
   // d3.json(geoAPI).then(function (geoData) {
   // updateMap(geoData, dropdown_options);
   // console.log('map updated');
   // });
 
   d3.json(`/zipcodes`).then(function (zipData) {
     // d3.json("data.json", function (zipData) {
     console.log(zipData);
     // d3.json(geoAPI, function (geoData) {
     d3.json(geoAPI).then(function (geoData) {
 
       geoData.features.map(res => Object.assign(res, {
         properties: {
           ...res.properties,
           ...zipData[res.properties.ZCTA5CE10]
         }
       }))
 
     updateMap(geoData, dropdown_options);
     console.log('map updated');
 
     })
 
   })
 
   /* end */

  var url = `/${variable.toLowerCase()}`;

  d3.json(url).then(function (response) {

    var zips = response;

    var zip_list = []

    zips.forEach(function (zip) {
      zip_list.push(zip.toString())
    })

    // console.log(zip_list);


    /* Start */

    var table = d3.select("#zip_code_list");

    var index = 1;

    d3.selectAll(".otherClass").remove();

    zip_list.forEach(function (d) {


      new_row = table.append('tr')
        .on("click", function () {
          // Put update function in here
          zipcode = parseInt(d, 10);
          // console.log(zipcode);
          createRadar(zipcode);
          createTable(zipcode);
          console.log(zipcode);
          mapPan(zipcode);
        });
      new_row.append('td').text(index).classed("otherClass", true);
      new_row.append('td').text(d).classed("otherClass", true);

      index = index + 1
    })






    /* End */

    /* Start */
    // data_reset=[]

    // d3.select("ol")
    // .selectAll("li")
    // .data(data_reset)
    // .exit()
    // .remove();

    // d3.select("ol")
    // .selectAll("li")
    // .data(zip_list)
    // .enter()
    // .append("li")
    // .text(function(d) {
    //   return d;
    // })
    // .on("click",function(d){
    //   // Put update function in here
    //   zipcode = parseInt(d,10);
    //   console.log(zipcode);
    //   createRadar(zipcode);
    //   createTable(zipcode);
    // });

    /* End */

  })
}



function updateMap(dataset, newProperty) {

  L.choropleth(dataset, {
    valueProperty: newProperty,
    // scale: ["#008073", "#FFFDCC"],
    scale:updateScale(newProperty),
    steps: 10,
    mode: "q",
    style: {
      color: "#fff",
      weight: 1
    },
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseover: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        mouseout: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
        click: function (event) {
          myMap.fitBounds(event.target.getBounds());
        }
      });
      layer.bindPopup("<h2>Zip Code: " + feature.properties.ZCTA5CE10 +
        "</h2> <hr> <p>Average Income: $" + feature.properties.income +
        "<br>Crime Rate: " + feature.properties.crime +
        "<br>Education Level: " + feature.properties.education +
        "<br>Average Temperature: " + feature.properties.winter_temp +
        "<br>Cost of Living: " + feature.properties.cost_of_living +
        "</p>");
    }
  }).addTo(myMap);
}

function updateScale(newProperty) {
  if (newProperty === "crime") {
    return ['#fff7fb', '#014636']
  }
  else if (newProperty === "income") {
    return ["#008073", "#FFFDCC"]
  }
  else if (newProperty === "education") {
    return ["#f7fcfd", "#4d004b"]
  }
  else if (newProperty === "winter_temp") {
    return ["#ffffcc", "#800026"]
  }
  else {
    return ["#096900", "#FDFFFD"]
  }
}

function init() {


  var url = '/income';

  d3.json(url).then(function (response) {

    var zip_list = response;
    // console.log(zip_list);

    /* start */
    // d3.select("ol")
    // .selectAll("li")
    // .data(zip_list)
    // .enter()
    // .append("li")
    // .text(function(d) {
    //   return d;
    // })
    // .on("click",function(d){
    //   // Put update function in here
    //   zipcode = parseInt(d,10);
    //   console.log(zipcode);
    //   createTable(zipcode);
    //   createRadar(zipcode);
    // })
    /* finish */

    /* start */

    var zip_table = d3.select("#zip_code_list");

    // console.log(zip_table);

    var index = 1;

    zip_list.forEach(function (d) {

      // console.log(d);

      new_row = zip_table.append('tr')
        .on("click", function () {
          // Put update function in here
          zipcode = parseInt(d, 10);
          // console.log(zipcode);
          createRadar(zipcode);
          createTable(zipcode);
          console.log(zipcode);
          mapPan(zipcode);
        });

      new_row.append('td').text(index).classed("otherClass", true);
      new_row.append('td').text(d).classed("otherClass", true);;

      // console.log(new_row);

      index = index + 1

    });
    /* finish */
  })

  // Choropleth creation
  
  // var geoAPI =
  //   "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/ca_california_zip_codes_geo.min.json";
  
  var geoAPI = '/geojson'

  console.log(geoAPI)
  d3.json(`/zipcodes`).then(function (zipData) {
    // d3.json("data.json", function (zipData) {
    // console.log(zipData)
    // d3.json(geoAPI, function (geoData) {
    d3.json(geoAPI).then(function (geoData) {

      geoData.features.map(res => Object.assign(res, {
        properties: {
          ...res.properties,
          ...zipData[res.properties.ZCTA5CE10]
        }
      }))

      L.choropleth(geoData, {
        valueProperty: selected_dataset,
        scale: updateScale(selected_dataset),
        steps: 10,
        mode: "q",
        style: {
          color: "#fff",
          weight: 1,
          fillOpacity: 0.5
        },
        // """Adding interaction functions"""
        onEachFeature: function (feature, layer) {
          layer.on({
            mouseover: function (event) {
              layer = event.target;
              layer.setStyle({
                fillOpacity: 0.9
              });
            },
            mouseout: function (event) {
              layer = event.target;
              layer.setStyle({
                fillOpacity: 0.5
              });
            },
            click: function (event) {
              myMap.fitBounds(event.target.getBounds());
            }
          });
          layer.bindPopup("<h2>Zip Code: " + feature.properties.ZCTA5CE10 +
            "</h2> <hr> <p>Average Income: $" + feature.properties.income +
            "<br>Crime Rate: " + feature.properties.crime +
            "<br>Education Level: " + feature.properties.education +
            "<br>Average Temperature: " + feature.properties.winter_temp +
            "<br>Cost of Living: " + feature.properties.cost_of_living +
            "</p>");
        }
      }).addTo(myMap);
      // })
      // dropdown dataset selection
      var dropDown = d3.select("#dropdown");

      dropDown.on("change", function () {

        selected_dataset = d3.event.target.value;

        updateMap(geoData, selected_dataset);
      });
    })
  })
}


init();


