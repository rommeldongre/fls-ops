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
    
    .when('/items', {
        templateUrl : 'items.html',
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
            editingItem: false,
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
                    $scope.uploadImage = function(file){
                        var reader = new FileReader();
                        reader.onload = function(event) {
                            $scope.$apply(function() {
                                $scope.submit.image = reader.result;
                            });
                        }
                        reader.readAsDataURL(file);
                    }

                    $scope.categories = [];

                    var populateCategory = function(id){
                        var req = {
                            operation:"getNext",
                            token: id
                        }

                        displayCategory(req);
                    }

                    var displayCategory = function(req){
                        $.ajax({
                            url: '/flsv2/GetCategoryList',
                            type:'get',
                            data: {req: JSON.stringify(req)},
                            contentType:"application/json",
                            dataType: "json",
                            success: function(response) {
                                if(response.Code === "FLS_SUCCESS") {
                                    $scope.categories.push(JSON.parse(response.Message).catName);
                                    populateCategory(response.Id);
                                }
                                else{
                                    //all categories are loaded
                                }
                            },
                            error:function() {
                            }
                        });
                    }

                    // called on the page load
                    populateCategory('');

                    $scope.categorySelected = function(c){
                        $scope.submit.category = c;
                    }

                    $scope.leaseTerms = [];

                    var populateLeaseTerm = function(id){
                        var req = {
                            operation:"getNext",
                            token: id
                        }

                        displayLeaseTerm(req);
                    }

                    var displayLeaseTerm = function(req){
                        $.ajax({
                            url: '/flsv2/GetLeaseTerms',
                            type:'get',
                            data: {req: JSON.stringify(req)},
                            contentType:"application/json",
                            dataType: "json",
                            success: function(response) {
                                if(response.Code === "FLS_SUCCESS") {
                                    $scope.leaseTerms.push(JSON.parse(response.Message).termName);
                                    populateLeaseTerm(response.Id);
                                }
                                else{
                                    //all categories are loaded
                                }
                            },
                            error:function() {
                            }
                        });
                    }

                    // called on the page load
                    populateLeaseTerm('');

                    $scope.leaseTermSelected = function(l){
                        $scope.submit.leaseTerm = l;
                    }

                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $uibModalInstance.close($scope.submit);
                    };
                    $scope.modalOptions.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            }

            return $uibModal.open(tempModalDefaults).result;
        };

    }]);
