var myApp = angular.module('myApp', ['ui.bootstrap', 'ngRoute', 'cp.ng.fix-image-orientation']);

myApp.run(['loginService', function(loginService){

    if(loginService.user == "" || loginService.user == null || loginService.user == "anonymous")
        window.location.replace("index.html");

}]);

myApp.config(function($routeProvider){

    $routeProvider

    .when('/', {
        templateUrl : 'leases.html',
        controller : 'leasesCtrl'
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
	
	.when('/events', {
        templateUrl : 'events.html',
        controller : 'eventsCtrl'
    })

    .when('/leases', {
        templateUrl : 'leases.html',
        controller : 'leasesCtrl'
    })

    .when('/notifications', {
        templateUrl : 'notifications.html',
        controller : 'notificationsCtrl'
    })
	
	.when('/leads', {
        templateUrl : 'leads.html',
        controller : 'leadsCtrl'
    })

    .otherwise({redirectTo : '/'});

});

myApp.controller('myAppCtrl', ['$scope', 'loginService', function($scope, loginService){

    $scope.isAdmin = true;

    $scope.head = {};

    if(loginService.user == 'ops@frrndlease.com'){
        $scope.isAdmin = false;
    }

    $scope.logout = function(){
        loginService.logout();
    }

    var displayUnreadNotifications = function(){
        $.ajax({
			url: '/GetUnreadEventsCount',
			type: 'post',
			data: JSON.stringify({userId: loginService.user}),
			contentType:"application/json",
			dataType:"json",

			success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.head.unread = response.unreadCount;
                    });
                }
			},
			error: function() {
			}
		});
    }

    displayUnreadNotifications();

    $scope.openNotifications = function(){
        window.location.replace("myapp.html#/notifications");
    }

    $scope.$on('updateEventsCount', function(event){
        displayUnreadNotifications();
    });

}]);

myApp.service('eventsCount', ['$rootScope', function($rootScope){

    this.updateEventsCount = function(){
        $rootScope.$broadcast('updateEventsCount');
    }
}]);

myApp.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

myApp.service('loginService', function(){

    this.user = localStorage.getItem("adminloggedin");

    this.userName = localStorage.getItem("adminloggedinName");

    this.userAccessToken = localStorage.getItem("adminloggedinAccess");

    this.logout = function(){
        localStorage.setItem("adminloggedin", "anonymous");
        window.location.replace("index.html");
    }

});

// service to implement modal
myApp.service('modalService', ['$uibModal', 'loginService', function ($uibModal, loginService) {

    var modalDefaults = {
        animation: true,
        backdrop: true,
        keyboard: true,
        templateUrl: 'modal.html'
    };

    var modalOptions = {
        actionButtonText: 'YES',
        showCancel: true,
        itemStatusDropdown: false,
        userLiveStatusDropdown: false,
        userVerificationDropdown: false,
        leaseStatusDropdownOps: false,
        leaseStatusOps: '',
        leaseStatusDropdownAdmin: false,
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

                //beginning of image display
                $scope.uploadPrimaryImage = function(file){
                    EXIF.getData(file, function(){
                        exif = EXIF.getAllTags(this);
                        picOrientation = exif.Orientation;
                    });

                    var reader = new FileReader();
                    reader.onload = function(event) {
                        loadImage(
                            event.target.result,
                            function(canvas){
                                    var req = {
                                        userId: loginService.user,
                                        accessToken: loginService.userAccessToken,
                                        image: canvas.toDataURL(),
                                        uid: $scope.submit.uid,
                                        existingLink: $scope.submit.image,
                                        primary: true
                                    }

                                    $scope.$apply(function(){
                                        $scope.submit.image = "loading";
                                    });

                                    $.ajax({
                                        url: '/SaveImageInS3',
                                        type: 'post',
                                        data: JSON.stringify(req),
                                        contentType: "application/x-www-form-urlencoded",
                                        dataType: "json",

                                        success: function(response) {
                                            if(response.code == 0){
                                                $scope.$apply(function(){
                                                    $scope.submit.image = response.imageLink;
                                                });
                                            }else{
                                                if(response.code == 400)
                                                    loginService.logout();
                                                $scope.$apply(function(){
                                                    $scope.submit.image = "";
                                                });
                                            }
                                        },

                                        error: function() {
                                            modalService.showModal({}, {bodyText: "Something is Wrong with the network.",showCancel: false,actionButtonText: 'OK'}).then(function(result){},function(){});
                                        }
                                    });
                            },
                            {
                                maxWidth: 450,
                                maxHeight: 450,
                                canvas: true,
                                orientation: picOrientation
                            }
                        );
                    }
                    reader.readAsDataURL(file);
                }
                //end of image display

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
                        url: '/GetCategoryList',
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
                        url: '/GetLeaseTerms',
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

myApp.directive('loadImage', ['$http', function($http){
    return{
        restrict:'A',
        scope: {
            'loadImage': '=',
            'maxWidth': '=?',
            'maxHeight': '=?'
        },
        link: function(scope, element, attrs){
            scope.$watch('loadImage', function(){
                var MaxWidth = 300;
                var MaxHeight = 300;

                var ImgSrc = scope.loadImage;

                if(scope.maxWidth)
                    MaxWidth = scope.maxWidth;
                if(scope.maxHeight)
                    MaxHeight = scope.maxHeight;

                if(ImgSrc != 'loading' && ImgSrc != '' && ImgSrc != null && ImgSrc != 'null' && ImgSrc != undefined){
                    loadImage(
                        ImgSrc,
                        function(canvas){
                            element.removeAttr('width');
                            element.removeAttr('height');
                            attrs.$set('ngSrc', canvas.toDataURL());
                        },
                        {
                            maxWidth: MaxWidth,
                            maxHeight: MaxHeight,
                            canvas: true,
                            crossOrigin: "anonymous"
                        }
                    );
                }else if(ImgSrc === '' || ImgSrc === null || ImgSrc === 'null' || ImgSrc === undefined){
                    attrs.$set('width', MaxWidth);
                    attrs.$set('height', MaxHeight);
                }

            });
        }
    }
}]);
