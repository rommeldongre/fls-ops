var indexApp = angular.module('indexApp', ['ui.bootstrap', 'ngRoute']);

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

// service to implement modal
indexApp.service('modalService', ['$uibModal',
    function ($uibModal) {

        var modalDefaults = {
            animation: true,
            backdrop: true,
            keyboard: true,
            templateUrl: '/fls-ops/modal.html'
        };

        var modalOptions = {
            actionButtonText: 'YES',
            showCancel: true,
            itemStatusDropdown: false,
			labelText: 'Default Label Text',
            submitting: false,
            cancelButtonText: 'Cancel',
            headerText: 'Frrndlease Dashboard Says',
            bodyText: 'Perform this action?'
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $uibModalInstance) {
                    $scope.submit = {};
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $uibModalInstance.close($scope.submit.url);
                    };
                    $scope.modalOptions.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            }

            return $uibModal.open(tempModalDefaults).result;
        };

    }]);
