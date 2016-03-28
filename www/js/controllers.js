angular.module('starter.controllers', ['chart.js'])

.controller('MapCtrl', function($scope, $ionicLoading, $http, $ionicSideMenuDelegate, _, $compile, $location) {

  $scope.buildings = []
  $scope.map = true;
  $scope.showMapPage = false
  $scope.chart_options = [
    'chart chart-bar',
    'chart chart-doughnut',
    'chart chart-radar',
    'chart chart-pie',
    'chart chart-polar-area',
    'chart chart-base'
  ]

  $scope.test = false;

  $scope.chartType = 'chart chart-bar';

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 65, 65, 56, 55, 40],
    [28, 48, 40, 19, 65, 27, 65]
  ];


  $scope.initialize = function (){


    var mapOptions = {
      center: new google.maps.LatLng(45.088038, -64.366088),
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      preventZooming: false

    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
  
    $scope.getBuildings();

  }

  if (document.readyState === "complete") {
    $scope.initialize();
  } else {
    google.maps.event.addDomListener(window, 'load', $scope.initialize);
  }


  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.getDataDailyForBuilding = function () {


  }

  $scope.setMarkers = function(){
      for (i = 0; i < $scope.buildings.length; i++) { 
          var lat = $scope.buildings[i].location.latitude
          var lng = $scope.buildings[i].location.longitude
          if (lat != "" && lng != ""){
            $scope.buildings[i].marked = true;
            $scope.buildings[i].selected = false;

            var latLng = new google.maps.LatLng(lat, lng);
            var marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: latLng
            }); 
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
            var infowindow = new google.maps.InfoWindow();

            var content = '<div><b>' + $scope.buildings[i].name + '</b>  <small>(' + $scope.buildings[i].code + ')</small> <input ng-model="buildings[' + i + '].selected" type="checkbox" ng-click="select(buildings[' + i + '])"></input><br>' + 
                          '<b>Profile: </b>' + $scope.buildings[i].profile + '<br>' + 
                          '<b>Built: </b>' + $scope.buildings[i].built + '<b> Renovated: </b>' + $scope.buildings[i].renovated + '<br>' +
                          '<b>Size: </b>' + $scope.buildings[i].size + ' sqft.' +
                          '</div>';

            google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
              return function() {
                console.log('=====', content)
                var compiled = $compile(content)($scope);
                $scope.$apply();
                infowindow.setContent(compiled[0]);
                infowindow.open($scope.map, marker);
              };
            })(marker, content, infowindow)); 

          }
          else{
            $scope.buildings[i].marked = false;

          }

          $scope.buildings[i].googleMarker = marker;
      }
  }



  $scope.getBuildings = function(){
    return $http.get("http://213.168.249.135:4000/api/getBuildings").then(function(response) {
        console.log('Response: ', response);
        
        console.log('Map: ', $scope.map);
        $scope.map.markers = []
        $scope.buildings = response.data;

        $scope.setMarkers();

    });
  }

  $scope.test = function () {
    console.log('======================++=======================');
    console.log($scope.buildings);
  }

  $scope.goTo = function (where) {
    // $scope.getBuildings();
    // $location.path(where);
    $scope.map = !$scope.map
  }

  $scope.showMap = function () {
    return $scope.showMapPage = !$scope.showMapPage;
  }

  $scope.select = function (building) {
    if (building.selected){
      building.googleMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
    }
    else{
      building.googleMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
    
    }
    building.selected = !building.selected
  }

  $scope.pinnedBuildings = function () {
    var count = 0
    for (var i = 0; i < $scope.buildings.length; i++){
      if ($scope.buildings[i].marked == true){
        count++;
      }
    }
    return count
  }

  $scope.selectedBuildings = function () {
    var count = 0
    for (var i = 0; i < $scope.buildings.length; i++){
      if ($scope.buildings[i].selected == true){
        count++;
      }
    }
    return count
  }

  $scope.openMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  }


  $scope.mapCreated = function(map) {
    console.log('================', map);
    $scope.map = map;
    $scope.setMarkers();
    console.log('================', $scope.map);

  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };
})
.controller('tmpCtrl', function($scope, $ionicLoading, $http, $ionicSideMenuDelegate, _, $compile, $location) {

  console.log('building in tmp: ', $scope.buildings);
});
