var indexApp = angular.module('indexApp', ['ngRoute']);

indexApp.config(function($routeProvider){
    
    $routeProvider
    
    .when('/', {
        templateUrl : 'dashboard.html'
    })
    
    .when('/users', {
        templateUrl : 'users.html',
        controller : 'userCtrl'
    })
    
    .when('/store', {
        templateUrl : 'store.html',
        controller : 'storeCtrl'
    })
    
    .when('/requests', {
        templateUrl : 'requests.html',
        controller : 'requestsCtrl'
    })
        
    .when('/leases', {
        templateUrl : 'leases.html',
        controller : 'leasesCtrl'
    })
    
    .otherwise({redirectTo : '/'});
    
});