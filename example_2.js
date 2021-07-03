$(function () {
    // Setup leaflet map
    

    var map = new L.Map('map').setView([-6.97271941301229,110.414569891822],18); //Center map and default zoom level

    var markersLayer = new L.LayerGroup();
    map.addLayer(markersLayer);



    var basemapLayer = new L.TileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid2FoeXVkbSIsImEiOiJjazliYzh2YmcwMnduM2hueWV3a3ozbW5sIn0.VXnWR-rP0rVVR5Z8tqCBqA', {
        maxZoom: 20,
        attribution: '',
        id: 'mapbox/streets-v9',
        tileSize: 512,
        zoomOffset: -1
    });

        var smallIcon = L.icon({
        iconUrl: 'images/st3.png',
        iconSize: [18, 18],
        iconAnchor: [4, 13],
        popupAnchor: [3, -12]
    });

    for (i in stasiun.features) {
        var title = stasiun.features[i].properties.namobj,  //value searched
            info = stasiun.features[i].properties.namobj,
            marker = new L.Marker(new L.latLng(stasiun.features[i].properties.lon, stasiun.features[i].properties.lat), { title: title, icon: smallIcon });//se property searched
        marker.bindPopup(info);
        markersLayer.addLayer(marker);
    }

    //Sidebar Control
    var sidebar = L.control.sidebar({
        autopan: true,
        container: "sidebar",
        position: "left"
    }).addTo(map);

    // Adds the background layer to the map
    map.addLayer(basemapLayer);

    // Style dan POPUP JSON Jalur Kereta
     var myStyle = {
        "color": "maroon",
        "weight": 2,
        "opacity": 0.65

    };

    var myStyle2 = {
        "color": "red",
        "weight": 2,
        "opacity": 0.65
    };

    function popUp(f, l) {
        var out = [];
        if (f.properties) {
            // for(key in f.properties){
            //  console.log(key);
            // }
            out.push("Ini Jalur Rel Kereta Api");
            l.bindPopup(out.join("<br />"));
        }
    }

    // LEGENDA 
    function iconByName(name) {
        return '<i class="icon icon-' + name + '"></i>';
    }

    function featureToMarker(feature, latlng) {
        return L.marker(latlng, {
            icon: L.divIcon({
                className: 'marker-' + feature.properties.amenity,
                html: iconByName(feature.properties.amenity),
                iconUrl: '/images/markers/' + feature.properties.amenity + '.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        });
    }

    var baseLayers = [
        {
            group: "Basemap Layers",
            icon: iconByName('parking'),
            collapsed: true,
            layers: [
                {
                    name: "Open Street Map",
                    layer: basemapLayer
                },
                {
                    name: "Open Street Map Mapnik",
                    layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    })
                },
                {
                    name: "Google Street",
                    layer: L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                        maxZoom: 20,
                        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                        attribution: 'Map by <a href="https://maps.google.com/">Google</a>'
                    })
                },
                {
                    name: "Google Hybrid",
                    layer: L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                        maxZoom: 20,
                        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                        attribution: 'Map by <a href="https://maps.google.com/">Google</a>'
                    })
                }
            ]
        }
    ];

    var overLayers = 
    [
        {
            name: "Rel Kereta Semarang - Jakarta",
            icon: iconByName('bar'),
            layer: new L.GeoJSON(smgjkt, { onEachFeature: popUp, style: myStyle, pointToLayer: featureToMarker }).addTo(map)
        },
        {
            name: "Rel Kereta Jakarta - Semarang",
            icon: iconByName('drinking_water'),
            layer: new L.GeoJSON(jktsmg, { onEachFeature: popUp, style: myStyle2, pointToLayer: featureToMarker }).addTo(map)
        },
    ];

    // var panelLayers = new L.Control.PanelLayers(baseLayers, overLayers, {
    //     collapsibleGroups: true,
    //     collapsed: true
    // });
    // map.addControl(panelLayers);

    var layerControl = new L.Control.PanelLayers(
        baseLayers, overLayers,
        {
            position: "topleft",
            collapsibleGroups: false,
            collapsed: false
        }
    ).addTo(map);


    //Move Layers control to sidebar
    var layerControlContainer = layerControl.getContainer();
    $("#layercontrol").append(layerControlContainer);
    $(".leaflet-control-layers-list").prepend("<strong class='title'>Base Maps</strong><br>");
    $(".leaflet-control-layers-separator").after("<br><strong class='title'>Layers</strong><br>");

    // Colors for AwesomeMarkers
    var _colorIdx = 0,
        _colors = [
            'red',
            'red',
            'red',
            'red',
            'red',
            'green',
            'green',
            'blue',
            'blue',
            'green',
            'blue' 
     
        ];

    function _assignColor() {
        return _colors[_colorIdx++ % 11];
    }

    // =====================================================
    // =============== Playback ============================
    // =====================================================

    // Playback options
    var playbackOptions = {
        // layer and marker options
        layer: {
            pointToLayer: function (featureData, latlng) {
                var result = {};

                if (featureData && featureData.properties && featureData.properties.path_options) {
                    result = featureData.properties.path_options;
                }

                if (!result.radius) {
                    result.radius = 5;
                }

                return new L.CircleMarker(latlng, result);
            }
        },

        marker: function () {
            return {
                icon: L.AwesomeMarkers.icon({
                    prefix: 'fa',
                    icon: 'train',
                    markerColor: _assignColor()
                }),
                getPopup: function (feature) {
                    return feature.properties.title;
                }
            };
        },
        popups: true,
        fadeMarkersWhenStale: true,
        tracksLayer: false
    };

    // Initialize playback
    console.log(demoTracks)
    var playback = new L.Playback(map, demoTracks, null, playbackOptions);

    // Initialize custom control
    var control = new L.Playback.Control(playback);
    control.addTo(map);

    // Add data
    playback.addData(ka309, ka281, ka263, ka255, ka251, ka13, ka11, ka0, ka105, ka73, ka127, 
ka310, ka282, ka264, ka256, ka252, ka14, ka12, ka00, ka106, ka74, ka128);

});
