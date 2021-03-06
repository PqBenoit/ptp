  function map(){

    getLocation();

    var bars = getBarsLocation(),
    i,
    distance = '',
    date = new Date(),
    minMapZoom = 14;

    var iconUrl = 'http://payetapinte.fr/assets/img/icons/marker.png',
    iconKingUrl = 'http://payetapinte.fr/assets/img/icons/markerCheaper.png',
    iconUserUrl = 'http://payetapinte.fr/assets/img/icons/userMarker.png';

    var markerIcon = new google.maps.MarkerImage(
        iconUrl, null,  null, null,
        new google.maps.Size(34, 44)
        ),
    markerBigIcon = new google.maps.MarkerImage(
        iconUrl, null,  null, null,
        new google.maps.Size(51, 66)
        ),
    markerKing = new google.maps.MarkerImage(
        iconKingUrl, null,  null, null,
        new google.maps.Size(34, 53)
        ),
    markerKingBig = new google.maps.MarkerImage(
        iconKingUrl, null,  null, null,
        new google.maps.Size(51, 80)
        ),
    markerUser = new google.maps.MarkerImage(
        iconUserUrl, null,  null, null,
        new google.maps.Size(20, 20)
    );

    function ajustOptionsMap(user) {
        var currentHour = date.getHours(),
        nightHours  = [20, 8] ;

        if (currentHour > nightHours[0] || currentHour < nightHours[1]){

            var options = {
                zoom: 15,
                center: new google.maps.LatLng(user[0], user[1]),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: false,
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                overviewMapControl: false,
                rotateControl: false,
                zoomControlOptions: false,
                scaleControlOptions: false,
                styles: [
                {
                    "featureType": "water",
                    "stylers": [
                    { "lightness": 23 },
                    { "color": "#43668a" }
                    ]
                },{
                    "featureType": "poi",
                    "stylers": [
                    { "visibility": "off" }
                    ]
                },{
                    "elementType": "labels.text.fill",
                    "stylers": [
                    { "color": "#000000" }
                    ]
                },{
                    "featureType": "landscape",
                    "elementType": "geometry.fill",
                    "stylers": [
                    { "color": "#184a76" },
                    { "saturation": -40 }
                    ]
                },{
                    "featureType": "road",
                    "elementType": "geometry.stroke",
                    "stylers": [
                    { "color": "#273b57" },
                    { "weight": 1.5 }
                    ]
                },{
                    "elementType": "labels.text.stroke",
                    "stylers": [
                    { "color": "#ffffff" },
                    { "weight": 2 }
                    ]
                },{
                }
                ]
            };


        }else{

            var options = {
                zoom: 15,
                center: new google.maps.LatLng(user[0], user[1]),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: false,
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                overviewMapControl: false,
                rotateControl: false,
                zoomControlOptions: false,
                scaleControlOptions: false,
                styles: [
                {
                    "featureType": "poi",
                    "stylers": [
                    { "visibility": "off" }
                    ]
                }
                ]
            };
        }
        return options;
    }


    // Geolocation from user :
    function getLocation()
    {
        var options = {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0
        };

        function success(position) {
            setup_map(position);
        };

        function error(err) {
            // alert('Nous ne sommes pas parvenu à vous Géolocaliser ! :-(');
                setup_map(null);
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
        }


    // Generate map and markers :
    function setup_map(position){

        // Map is gonna be loaded, we can safely remove the loader
        $('#loading').hide() ;

        if (position == null){
            var user = [48.8374242, 2.3573167]; // Actual default : Paris
        }else{
            var user = [position.coords.latitude, position.coords.longitude];
        }

        // Ajust the Theme and center of map
        options = ajustOptionsMap(user);

        var map = new google.maps.Map(document.getElementById('map'),options);

        var markers = [];

        // When the map is loaded !
        google.maps.event.addListenerOnce(map, 'idle', function(){

            var userMarker = addUserMarker(user);
            var aroundBars = getBarsAround(bars);

            if(! aroundBars[0]){
                displayNoBar('block');
            }else{
                CreateOrDeleteBar(markers, aroundBars);
            }

            // Search Bar completion
            searchPlace();

//            var circleUser = new google.maps.Circle({
//                position: new google.maps.LatLng(user[0], user[1]),
//                radius:300000,
//                map: map,
//                strokeColor: '#FF0000',
//                strokeOpacity: 0.8,
//                strokeWeight: 2,
//                fillColor: '#FF0000',
//                fillOpacity: 0.35,
//                clickable: false
//            });

            //when user drag map
            google.maps.event.addListener(map, 'dragend', function() {
                aroundBars = getBarsAround(bars);
                if(aroundBars[0]){
                    displayNoBar('none');
                    CreateOrDeleteBar(markers, aroundBars);
                }
            }),

            //when user zoom map
            google.maps.event.addListener(map, 'zoom_changed', function() {

                if (map.getZoom() < minMapZoom) map.setZoom(minMapZoom);

                aroundBars = getBarsAround(bars);
                if(aroundBars[0]){
                    displayNoBar('none');
                    CreateOrDeleteBar(markers, aroundBars);
                }
            });

        });


        //Add the user marker on the map
        function addUserMarker(user){
            var UserMarker = new google.maps.Marker({
                position: new google.maps.LatLng(user[0], user[1]),
                map: map,
                animation: google.maps.Animation.DROP,
                icon: markerUser
            });
            return UserMarker;
        }

        //Get the bars located on the map screen
        function getBarsAround(bars){

            // On récupère les coordonnées des coins de la map
            var bds = map.getBounds();
            var South_Lat = bds.getSouthWest().lat();
            var South_Lng = bds.getSouthWest().lng();
            var North_Lat = bds.getNorthEast().lat();
            var North_Lng = bds.getNorthEast().lng();
            var aroundBars = Array();

            for (var i = 0; i < bars.length; i++) {
                if (bars[i][2] < North_Lat && bars[i][2] > South_Lat && bars[i][3] < North_Lng && bars[i][3] > South_Lng )
                {
                    aroundBars.push(bars[i]);
                }
            }

            aroundBars = distanceUserBar(aroundBars);

            return aroundBars;
        }

        // Create or delete bar on the viewport
        function CreateOrDeleteBar(markers, aroundBars){

            var currentMarkersId = [];
            for (var i = 0; i < markers.length; i++){
                currentMarkersId.push(markers[i][0]);
            }
            for (var i = 0; i < aroundBars.length; i++) {
                if ( currentMarkersId.indexOf(aroundBars[i][0]) < 0 ){
                    addBarMarker(aroundBars[i]);
                    showBarsPreview(aroundBars[i]);
                }
            }
        }

        //Add the marker bar on the map
        function addBarMarker(bar) {
            var marker = Array();
            marker[0] = bar[0];
            marker[1] = new google.maps.Marker({
                position: new google.maps.LatLng(bar[2], bar[3]),
                map: map,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
            });

            markers.push(marker);
            centerMarker(marker, bar);
        }

        //Screen the bar preview
        function showBarsPreview(bar){
            var previewUrl = window.location.origin + '/preview/' + bar[0];

            $.ajax({
                url: previewUrl,
                cache: true
            })
            .done(function( data ) {
                $( "#bars-container" ).append( data );
                showDistanceRate(bar);
                showBarPage(bar);
                reorganizeBarsList();
            });
        }

        //Screen the bar page
        function showBarPage(bar){
            var $bar = $('.preview-container').find("[data-id-bar="+ bar[0] +"]");

            $bar.on('click', function(){
                setupBarPage(bar);
            })
        }

        //Calcul the distance between user and bars
        function distanceUserBar(bars){

            var distance;

            for (var i = 0; i < bars.length; i++) {
                distance = calculHaversine(bars[i][2], bars[i][3], user[0], user[1])*1000;
                distance = Math.round(distance/10)*10 //arrondir au dixième;
                bars[i][4] = distance;
            }

            bars.sort(compare);

            function compare(a, b) {
                if (a[4] < b[4])
                    return -1;
                if (a[4] > b[4])
                    return 1;
                return 0;
            }
            return bars;
        }

        //Screen the distance between user and the bar
        function showDistanceRate(bar){
            var $bar =  $('.preview-container').find("[data-id-bar="+ bar[0] +"]"),
            $dContainer = $bar.contents().find('.distance');
//            dec = Math.round(((bar[4]/1000)%1) * 100);
//            if (bar[4]<1000)
//                $dContainer.text(bar[4]+"m");
//            else
//                $dContainer.text(Math.round(bar[4]/1000)+","+dec+"km");
            $dContainer.append(transformDistance(bar[4]) );

        }

        //Move map to marker bar and scroll bar list
        function centerMarker(marker, bar){
            var $barsContainer = $('#bars');
            google.maps.event.addListener(marker[1], 'click', function() {
                //Moving map center to a marker when clicking on it
                var Latlng = new google.maps.LatLng(bar[2], bar[3]);
                map.panTo(Latlng);

//            setupBarPage(bar);

            scrollBarsList(marker);
         });
}

        //Scroll the bars list on click on marker
        function scrollBarsList(marker){
            var barId = marker[0],
            posVSid = [],
            $barsPrev = $('.preview-container'),
            $container = $('#cache-container'),
            $innerContainer = $('#bars-container'),
            barHeight = $barsPrev.height(),
            barPos;

            $barsPrev.each(function(index){
                posVSid[index] = $(this).children('.preview').data('id-bar');

                if (posVSid[index]==barId)
                   barPos = index;
           })
            var time = 200+(Math.abs( ($container.scrollTop()-(barHeight*barPos))));
            $container.animate({scrollTop: barHeight*barPos}, time);
        }

        //Reorganize bars list by distance (or price?)
        function reorganizeBarsList(){
            var $barsPrev = $('.preview-container'), distanceT = [], priceT = [],
                $innerContainer = $('#bars-container'),
                barDistance,
                barHeight = $barsPrev.height();

            $barsPrev.each(function(){
                var barId = $(this).children().data('id-bar');
                for(i = 0; i < bars.length; i++){
                    if(bars[i][0] == barId){
                        barDistance = bars[i][4];
                    }
                }

                barDistance = parseInt(barDistance);
                distanceT.push(Array(barDistance, $(this)) );

                var barPrice = $(this).children().data('price');
                priceT.push(Array(barPrice, $(this)) );
            })

            distanceT.sort(sortNumber);
            priceT.sort(sortNumber);

            var bestPriceId = (priceT[0][1]).find('.preview').data('id-bar');

            for(i = 0; i < markers.length; i++){
                markers[i][1].setIcon(markerIcon);
                if(markers[i][0] == bestPriceId){
                    markers[i][1].setIcon(markerKing);
                }
            }

            function sortNumber(a,b) {
                return a[0] - b[0];
            }

            for(i = 0; i < distanceT.length-1; i++){
                var j = i+1
                distanceT[i][1].after(distanceT[j][1]);
            }
            $innerContainer.height(barHeight*($barsPrev.length)+140);
        }

        function searchPlace() {
            var input = (document.getElementById('pac-input'));
            var searchBox = new google.maps.places.SearchBox((input));
            // It would be cool to autofocus this.

            google.maps.event.addListener(searchBox, 'places_changed', function() {
                var places = searchBox.getPlaces();
                var bounds = new google.maps.LatLngBounds();

                for (var i = 0, place; place = places[i]; i++) {
                    bounds.extend(place.geometry.location);
                }
                map.fitBounds(bounds);
                map.setZoom(15);
            });

            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(map, 'bounds_changed', function() {
                var bounds = map.getBounds();
                searchBox.setBounds(bounds);
            });
        }
        function setupBarPage(bar){
            var $bar = $('.preview-container').find("[data-id-bar="+ bar[0] +"]"),
                $barsContainer = $('#bars'),
                isLoaded = false;

            if (!isLoaded){
                console.log('loaaaad');
                $bar.parent().addClass('prev-opened');
                isLoaded = true;
                var previewUrl = window.location.origin + '/page/' + bar[0];
                $.ajax({
                    url: previewUrl,
                    cache: true
                })
                    .done(function( page ){

                        $('#bars').animate({bottom: "0"}, 300);
                        barState = true;
                        $( "#bar-page" ).append(page);
                        $barsContainer.animate({left: -($barsContainer.width()/2)}, 300);

                        //Set the map
                        Latlng = new google.maps.LatLng(bar[2], bar[3]);
                        map.panTo(Latlng);
//                        map.setZoom(16);

                        //Set the marker
                        for (i = 0; i < markers.length; i++) {
                            if(markers[i][0] == bar[0]){
                                var barMarker = markers[i][1];
                                if (barMarker.icon.url == iconUrl)
                                    barMarker.setIcon(markerBigIcon);
                                if (barMarker.icon.url == iconKingUrl)
                                    barMarker.setIcon(markerKingBig);
                            }else{
                                if (markers[i][1].icon.url == iconUrl)
                                    markers[i][1].setIcon(markerIcon);
                                if (markers[i][1].icon.url == iconKingUrl)
                                    markers[i][1].setIcon(markerKing);
                            }
                        }

                        //Set the distance
                        var $distanceC = $('#fiche-bar').find('.page-distance'),
                            distance = bar[4],
                            $directionC = $('#fiche-bar').find('.direction');
                        $distanceC.append("à "+transformDistance(bar[4]));

                        //Set the link to plan
                        $directionC.append('<p><a href=\"http://maps.apple.com/maps?saddr='+user[0]+', '+user[1]+'&daddr='+bar[2]+', '+bar[3]+'\">Itinéraire</a></p>')
                        showRate();
                        open_rate_box();
                        close_rate_box();


                        $('.close').on('click', function(){
                            $bar.parent().removeClass('prev-opened');
                            if (barMarker.icon.url == iconUrl)
                                barMarker.setIcon(markerIcon);
                            if (barMarker.icon.url == iconKingUrl)
                                barMarker.setIcon(markerKing);

                            map.setZoom(15);
                            $barsContainer
                                .animate({left: 0}, 300, function(){
                                    $('#fiche-bar').remove();
                                });
                            isLoaded = false;


                        })
                    });
            }
//             map.setZoom(16);
        }
    }
}



function getBarsLocation(){
    var jsonUrl = window.location.origin + '/bars.json';
    var jsonBars = [];

    $.getJSON(jsonUrl, function(bar){
        $.each(bar, function(index){
            jsonBars[index] = [bar[index].id, bar[index].name, bar[index].latitude, bar[index].longitude]
        })
    })

    return jsonBars;
}

function displayNoBar(display){
    if (display == 'block'){
        var $nobar = $("#nobar"),
            $text = $nobar.find('p') ;

        $nobar.show();

        $text.height($text.height()).css("marginTop", -$text.height() )
    }
    else if (display == 'none'){
        $("#nobar").hide();
    }

}
// Distance calcul
function rad(x){
    return x*Math.PI/180;
}
function calculHaversine(barLat, barLnt, userLat, userLnt) {
    var R = 6371; // earth's mean radius in km
    var distLat  = rad(barLat - userLat);
    var distLong = rad(barLnt - userLnt);

    var a = Math.sin(distLat/2) * Math.sin(distLat/2) +
    Math.cos(rad(barLat)) * Math.cos(rad(userLat)) * Math.sin(distLong/2) * Math.sin(distLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d.toFixed(3);
}

function transformDistance(distance){
    var dec = Math.round(((distance/1000)%1) * 10);

    if (distance<1000)
        return "<span>"+distance+"</span>"+"m";
    else {
        if (dec != 0)
            return "<span>"+Math.round(distance/1000)+","+dec+"</span>"+"km"
        else
            return "<span>"+Math.round(distance/1000)+"</span>"+"km"
    }
}
