angular.module('starter.controllers', ['chart.js', 'underscore'])

.controller('MapCtrl', function($scope, $ionicLoading, $http, $ionicSideMenuDelegate, _, $compile, $location) {

  $scope.buildings = []
  $scope.showMap = true;
  $scope.showLine = true;
  $scope.showBar = false;
  $scope.showDoughnut = false;
  $scope.greenPin = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
  $scope.redPin = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
  $scope.yellowPin = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'

  $scope.test = false;
  $scope.optionSelected = 'Filter Buildings';
  $scope.chartType = 'chart chart-line';

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = [];
  $scope.data = [];
  $scope.tmpLabels = [];
  $scope.tmpData = [];

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

  $scope.filter = function (filterBy) {
    switch(filterBy) {
        case "Select All":
            $scope.setAll(true, "all")
            break;
        case "Select Residence":
            $scope.setAll(true, "residence")
            break;
        case "Select Academic":
            $scope.setAll(true, "academic")
            break;
        case "Deselect All":
            $scope.setAll(false, "all")
            break;
    }   
  }

  $scope.setChartType = function (type) {
    // doughnut removed from user options due to incapatibility
    switch(type) {
        case "chart chart-bar":
          $scope.showLine = false;
          $scope.showBar = true;
          $scope.showDoughnut = false;
          break;
        case "chart chart-line":
          $scope.showLine = true;
          $scope.showBar = false;
          $scope.showDoughnut = false;
          break;
            
        case "chart chart-doughnut":
          $scope.showLine = false;
          $scope.showBar = false;
          $scope.showDoughnut = true;
          break;
    } 
  }

  $scope.setAll = function (truth, type) {
    for (i = 0; i < $scope.buildings.length; i++) { 
      if (type == "all"){
        $scope.buildings[i].selected = truth;
      }
      else if ($scope.buildings[i].type == type){
        $scope.buildings[i].selected = truth;
      }
      else if ($scope.buildings[i].type != type){
        $scope.buildings[i].selected = !truth;

      }

      $scope.selectFromAll($scope.buildings[i]);
      $scope.setFlag($scope.buildings[i]);
    }
  }

  $scope.setSeries = function () {

    var selected = _.reject($scope.buildings, function(b){ return !b.selected; });
    console.log('set Series: ', selected)
    $scope.series = _.pluck(selected, "code");
    console.log('codes: ', $scope.series)

    $scope.labels = $scope.tmpLabels;
    $scope.data = [];
    console.log('labels', $scope.tmpLabels);

    for (i = 0; i < $scope.buildings.length; i++) { 

      if ($scope.buildings[i].selected){
        $scope.data.push($scope.tmpData[i]);
      }
    }

  
  }

  $scope.setFlag = function (building) {
    if (!building.selected && building.selectable){
      building.googleMarker.setIcon($scope.redPin)
    }
    else if (building.selectable){
      building.googleMarker.setIcon($scope.greenPin)
    
    }
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
          if ($scope.buildings[i].available == "inActive"){
            marker.setIcon($scope.yellowPin)
            $scope.buildings[i].selectable = false;
          }else{
            marker.setIcon($scope.redPin)
            $scope.buildings[i].selectable = true;
          }
          var infowindow = new google.maps.InfoWindow();

          var content = '<div><b>' + $scope.buildings[i].name + '</b>  <small>(' + $scope.buildings[i].code + ')</small> <input ng-if="buildings[' + i + '].selectable" ng-model="buildings[' + i + '].selected" type="checkbox" ng-click="select(buildings[' + i + '])"></input><br>' + 
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
        $scope.getDataHourly($scope.buildings[i])
        $scope.buildings[i].googleMarker = marker;

        // $scope.buildings[i].buildingData = [];
    }



  }

  $scope.getDataHourly = function (building) {
    var code = building.code;
    var today = new Date();
    var dd = today.getDate(); 
    var mm = today.getMonth() + 1; 
    var yyyy = today.getFullYear(); 
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 

    var day = mm + '-' + dd + '-' + yyyy;

    url = "http://213.168.249.135:4000/api/dataHour/" + day + "/" + code

    return $http.get(url).then(function(response) {
        building.buildingData = response.data;
        $scope.labels = [];
        var energyData = [];
        for (i = 0; i < building.buildingData.length; i++) { 
          if (building.selectable){
            var time = building.buildingData[i].time;
            if ($scope.tmpLabels.indexOf(time) == -1){
              $scope.tmpLabels.push(time)
            }
            energyData.push(building.buildingData[i].value)
          }
        }
        if (building.selectable){
          $scope.tmpData.push(energyData);
        }
    });
  }

  $scope.getCampusConsumption = function (code) {
    url = "http://213.168.249.135:4000/api/campusConsumption/"

    return $http.get(url).then(function(response) {
        $scope.totalCampusConsumption = response.data;
                // Create the legend and display on the map
        var legend = document.createElement('div');
        legend.id = 'legend';
        var content = [];
        content.push('<h4>Total Usage</h4>');
        content.push('<p>' + $scope.totalCampusConsumption + ' Kwh used today</p>');
        content.push('<h4>Pins</h4>');
        content.push('<img src="' + $scope.greenPin + '">' + '<p><b> Selected</b></p>');
        content.push('<img src="' + $scope.redPin + '">' + '<p><b> Unselected</b></p>');
        content.push('<img src="' + $scope.yellowPin + '">' + '<p><b> No Data</b></p>');
        legend.innerHTML = content.join('');
        legend.index = 1;
        $scope.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
    });
  }

  $scope.getBuildings = function(){
    return $http.get("http://213.168.249.135:4000/api/getBuildings").then(function(response) {
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
    $scope.showMap = !$scope.showMap;
  }

  $scope.showMap = function () {
    return $scope.showMapPage = !$scope.showMapPage;
  }

  $scope.select = function (building) {

    building.selected = !building.selected

    if (building.selected){
      building.googleMarker.setIcon($scope.greenPin)
    }
    else{
      building.googleMarker.setIcon($scope.redPin)
    
    }

    $scope.setSeries()
  }

  $scope.selectFromAll = function (building) {

    if (building.selected){
      building.googleMarker.setIcon($scope.redPin)
    }
    else{
      building.googleMarker.setIcon($scope.greenPin)
    
    }

    $scope.setSeries()
  }

  // returns count of building with markers
  $scope.pinnedBuildings = function () {
    var count = 0
    for (var i = 0; i < $scope.buildings.length; i++){
      if ($scope.buildings[i].marked == true){
        count++;
      }
    }

    return count
  }
  
  // returns count of buildings selected
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
    $scope.map = map;
    $scope.setMarkers();
  };

  $scope.getCampusConsumption();

});
