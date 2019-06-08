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

function updateMap(dataset, newProperty) {
    L.choropleth(dataset, {
        valueProperty: newProperty,
        scale: ["#008073", "#FFFDCC"],
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


var geoAPI =
    "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/ca_california_zip_codes_geo.min.json";

d3.json(`/zipcodes`, function (zipData) {
// d3.json("data.json", function (zipData) {
    console.log(zipData)
    d3.json(geoAPI, function (geoData) {

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

