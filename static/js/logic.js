// ========= Define JSON Data ========= //

// Earthquake API JSON Data URL (Past 7 days)
var EarthQuakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Tectonic Plates JSON Data URL
var TectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// ========= End JSON Data ========= //



// ======================  Define MAP LAYERS ====================== //

// // Define variables for our tile layers: streetmap, darkmap, light, grey, satellite, outdoor layers
var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
{
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});


var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
{
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});



var grayMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
{
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});


var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", 
{
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});



// Define a baseMaps object to hold base layers
var baseMaps = {
        "Street Map": streetMap,
        "Dark Map": darkMap,
        "Grayscale Map": grayMap,
        "Satellite Map": satelliteMap
};

// ======================  End MAP LAYERS ====================== //


// ========= Define LayerGroups & Overlay Objects ========= //

var earthquakes = new L.LayerGroup();
var tectonicplates = new L.LayerGroup();

// Create overlay object to hold our overlay layer
var overlayMaps = 
{
    "Earthquakes": earthquakes,
    "Tectonic Plates" : tectonicplates
};

// ========= End LayerGroups ========= //



// Get earthquake url/json data from the Earthquake API URL query
d3.json(EarthQuakeURL, function(EQdata)
{
    // Read tectonic plate data json
    d3.json(TectonicPlatesURL, function(TPdata) 
    {

        // Function to Determine Size of Circle Based on the Magnitude of the Earthquake
        function CircleSize(magnitude)
        {
            if (magnitude === 0)
                {   return 1;  }
            return magnitude * 4;
        }

        // Function to Determine Color of Circle Based on the Depth of the Earthquake
        function circleColor(depth) 
        {
            switch(true) 
            {
                case depth > 90:
                    return "red";
                case depth > 70:
                    return "orange";
                case depth > 50:
                    return "yellow";
                case depth > 30:
                    return "darkgreen";
                case depth > 10:
                    return "green";
                default:
                    return "lightgreen";
            };

        }

        // Creates an infobox of stats upon mouse click on earthquake
        function onEachFeature(feature, layer) 
        {   
            layer.bindPopup("<h4>LOCATION: " + feature.properties.place + "</h4><hr><p>DATE & TIME: " + new Date(feature.properties.time) + 
            "</p><hr><p>MAGNITUDE : " + feature.properties.mag + "</p>");

        };


        // Create a layer containing the features of Earthquake data
        L.geoJSON(EQdata, 
            {
                pointToLayer: function(feature, latlng) 
                {   return L.circleMarker(latlng,
                    {
                        opacity: 1,
                        fillOpacity: 0.8,
                        fillColor: circleColor(feature.geometry.coordinates[2]),
                        //fillColor: circleColor(feature.properties.mag),
                        color: "#000000",
                        radius: CircleSize(feature.properties.mag),
                        stroke: true,
                        weight: 0.5
                    })
                },

                // Call on Feature infobox (on earthquake click) function
                onEachFeature: onEachFeature
                    
            })
            // Add above to earthquakes Layer group and then that to myMap
            .addTo(earthquakes);
            //earthquakes.addTo(myMap);

        
        // Create our map, giving it the graymap and earthquakes layers to display on load
        var myMap = L.map("map", 
        {
            center: [ 37.09, -95.71 ],
            zoom: 4,
            layers: [grayMap, earthquakes]
        });

        L.geoJSON(TPdata, 
            {
                pointToLayer: function plateLines(feature, layer) 
                {   
                    return L.polyline(feature.geometry.coordinates),
                    {
                        onEachFeature: plateLines,
                        style: 
                        {
                            color: "pink",
                            weight: 2,
                            opacity: 1
                        }
                        
                    }
                },

                // Call on Feature infobox (on earthquake click) function
                onEachFeature: onEachFeature
                    
            })
            // Add above to earthquakes Layer group and then that to myMap
            .addTo(tectonicplates);
            //tectonicplates.addTo(myMap);



        // Creates a legend on bottom right of page detailing the depth/color measurements    
        var LegendBox = L.control({ position: "bottomright" });
        LegendBox.onAdd = function() 
        {
            
            var div = L.DomUtil.create("div", "legend"); 
            depth = [-10, 10, 30, 50, 70, 90];
            div.innerHTML += "<h3>Depth</h3>"
    
            for (var i = 0; i < depth.length; i++) 
            {
                div.innerHTML +=
                    '<i style="background: ' + circleColor(depth[i] + 1) + '"></i> ' +
                    depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
            }
            return div;
        };
        // Add Legend to the Map
        LegendBox.addTo(myMap);
            

        // Create Layer, pass in baseMaps/overlayMaps, and add it to the Map
        L.control.layers(baseMaps, overlayMaps).addTo(myMap);
    });

}); 

