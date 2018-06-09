var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(queryUrl, function(data) {
// Call createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData){
    function onEachFeature(feature,layer){
        layer.bindPopup("<h3>Location: " + feature.properties.place +
        "</h3><hr><h3>Magnitude: "+ feature.properties.mag +
        "</h3><hr><h3>Time: " + new Date(feature.properties.time) + "</h3>")
    }

    var earthquakes= L.geoJSON(earthquakeData,{
        onEachFeature: onEachFeature,
        pointToLayer: function(feature,latlng){
            return L.circleMarker(latlng,{
                radius: markersize(feature["properties"]["mag"]),
                color: markercolor(feature["properties"]["mag"]),
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    });

  createMap(earthquakes);
}

function markersize(magnitude) {
  return magnitude * 5;
}

function markercolor(magnitude) {
  return magnitude < 1 ? 'rgb(255,255,255)' :
    magnitude < 2 ? 'rgb(255,225,225)' :
      magnitude < 3 ? 'rgb(255,195,195)' :
        magnitude < 4 ? 'rgb(255,165,165)' :
          magnitude < 5 ? 'rgb(255,135,135)' :
            magnitude < 6 ? 'rgb(255,105,105)' :
              magnitude < 7 ? 'rgb(255,75,75)' :
                magnitude < 8 ? 'rgb(255,45,45)' :
                  magnitude < 9 ? 'rgb(255,15,15)' :
                    'rgb(255,0,0)';
}

function createMap(earthquakes) {
  var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYmVhc2hldGthciIsImEiOiJjamZ1bmw5YTkwM3NpMzNsYTV4NDJuaDZ5In0." +
  "GpypkbTBo8wbwQbGrMrX7w");
  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmVhc2hldGthciIsImEiOiJjamZ1bmw5YTkwM3NpMzNsYTV4NDJuaDZ5In0." +
    "GpypkbTBo8wbwQbGrMrX7w");
    var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmVhc2hldGthciIsImEiOiJjamZ1bmw5YTkwM3NpMzNsYTV4NDJuaDZ5In0." +
    "GpypkbTBo8wbwQbGrMrX7w");

  var baseMaps = {
    "Light Map": lightMap,
    "Street Map": streetMap,
    "Dark Map": darkMap
  };

  var plates = new L.LayerGroup();

  d3.json(platesUrl,function(data){
        L.geoJSON(data,{
            color:"green", 
            weight: 3
        }).addTo(plates);            
    })

  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": plates
  };

  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 2,
    layers: [lightMap, earthquakes, plates]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

  var div = L.DomUtil.create('div', 'info legend'),
  magnitude = [0,1,2,3,4,5],
  labels = [];


  for (var i = 0; i < magnitude.length; i++) {
    div.innerHTML +=
    '<i style="background:' + markercolor(magnitude[i] + 1) + '"></i> ' +
    magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    console.log(markercolor(magnitude[i]));
  }

  return div;
}
legend.addTo(myMap);
    
     
d3.json(queryUrl, function(data) {
  var getInterval = function(quake) {
    return {
      start: quake.properties.time,
      end:   quake.properties.time + quake.properties.mag * 18000000
    };
  };
  var timelineControl = L.timelineSliderControl({
    formatOutput: function(date) {
      return new Date(date).toString();
    }
  });
  
  var timeline = L.timeline(data, {
    getInterval: getInterval,
    pointToLayer: function(data, latlng){
      var hue_min = 120;
      var hue_max = 0;
      var hue = data.properties.mag / 10 * (hue_max - hue_min) + hue_min;
        return L.circleMarker(latlng, {
          radius: data.properties.mag * 3,
          color: "hsl("+hue+", 100%, 50%)",
          fillColor: "hsl("+hue+", 100%, 50%)"
          }).bindPopup('<a href="'+data.properties.url+'">Click here to learn more!</a>');
        }
      });
  timelineControl.addTo(myMap);
  timelineControl.addTimelines(timeline);
  timeline.addTo(myMap);
  });

};
