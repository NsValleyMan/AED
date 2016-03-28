angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'underscore', 'chart.js'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

})
.config(function($stateProvider, $urlRouterProvider) {


})
