var indexApp = angular.module('indexApp', []);

indexApp.controller('indexCtrl', ['$scope', 'loginService', function($scope, loginService){
    
    if(loginService.user == 'admin@frrndlease.com' || loginService.user == 'ops@frrndlease.com')
        window.location.replace("myapp.html");
    
    // Form login
    $scope.formLogin = function(email, password){
        if(email == 'admin@frrndlease.com' || email == 'ops@frrndlease.com'){
            password = (CryptoJS.MD5(password)).toString();
            var req = {
                token: email,
                signUpStatus: "email_activated",
                row: {
                    auth: password
                }
            }
            loginSend(req);
        }else{
            $scope.error = "This is an incorrect email!!";
        }
    }
    
    var loginSend = function(req){
        $.ajax({
            url: '/flsv2/LoginUser',
            type:'get',
            data: {req: JSON.stringify(req)},
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.Code === "FLS_SUCCESS") {
                    var obj = JSON.parse(response.Message);
                    localStorage.setItem("adminloggedin", obj.userId);
                    localStorage.setItem("adminloggedinName", obj.fullName);
					localStorage.setItem("adminReferralCode", obj.referralCode);
                    window.location.replace("myapp.html#/");
                }
                else{
                    $scope.$apply(function(){
                        $scope.error = response.Message;
                    });
                }
            },
            error: function() {}
        });
    }
}]);

indexApp.service('loginService', function(){
    
    this.user = localStorage.getItem("adminloggedin");
    
    this.userName = localStorage.getItem("adminloggedinName");
    
});
