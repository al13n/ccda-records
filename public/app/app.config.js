(function(){
	'use strict';
	
	var app = angular.module('ccda');

	app.config(function($stateProvider, $urlRouterProvider) {
  		$urlRouterProvider.otherwise("/");

 		$stateProvider
    		.state('home', {
      		url: "/",
      		controller: "HomeCtrl as homeCtrl",
      		templateUrl: "app/html/home.html"
    		});
		});
})();

