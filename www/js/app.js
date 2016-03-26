angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'underscore', 'chart.js'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

})
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state('index', {
    url: '/',
    templateUrl: 'map.html',
    controller: 'MapCtrl'

  })

  $stateProvider.state('map', {
    url: '/map',
    templateUrl: 'map.html'
  })

  $stateProvider.state('energy_use', {
    url: '/energy_use',
    templateUrl: 'energy_use.html'
  })
})
