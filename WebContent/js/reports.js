var reportsApp = angular.module('myApp');

reportsApp.controller('reportsCtrl', ['$scope', 'reportsApi', '$filter', function ($scope, reportsApi, $filter) {

    //    $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "December"];
    //    $scope.series = ['Sign Up', 'Requests', 'Leases'];
    //    $scope.data = [
    //        [65, 59, 80, 81, 56, 55, 40, 81, 56, 55, 40],
    //        [28, 48, 40, 19, 86, 27, 90, 81, 56, 55, 40],
    //        [78, 78, 90, 89, 36, 77, 50, 31, 36, 75, 20]
    //      ];

    $scope.checkbox = {
        cumulative: false
    };

    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{
        yAxisID: 'y-axis-1'
    }, {
        yAxisID: 'y-axis-2'
    }];
    $scope.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right'
                }
            ]
        }
    };

    $scope.fromDate = new Date();
    $scope.fromDate.setDate($scope.fromDate.getDate() - 7 * 10);
    $scope.toDate = new Date();

    var generateReport = function () {
        reportsApi.getReport({
            report: 'USER_TRACTION',
            freq: 'WEEKLY',
            from: $filter('date')(new Date(Date.parse($scope.fromDate)), 'yyyy-MM-dd'),
            to: $filter('date')(new Date(Date.parse($scope.toDate)), 'yyyy-MM-dd')
        }).then(
            function (response) {
                var res = response.data;
                res.labels.forEach(function(label, index, labels){
                    labels[index] = $filter('date')(new Date(Date.parse(label)), 'd MMM yy');
                });
                $scope.labels = res.labels;
                $scope.series = res.series;
                $scope.data = res.data;
                $scope.cumulativeData = angular.copy(res.data);
                calcCumulative();
            },
            function (error) {
                console.log(error);
            }
        );
    }

    $scope.plot = function() {
        generateReport();
    }

    generateReport();

    var calcCumulative = function() {
        $scope.cumulativeData.forEach(function(d, i){
            var total = 0;
            d.forEach(function(c, j) {
                total = total + c;
                $scope.cumulativeData[i][j] = total;
            });
        });
    }

}]);

reportsApp.service('reportsApi', ['$http', function ($http) {

    this.getReport = function (req) {
        return $http.post('/GetReport', JSON.stringify(req));
    }

}]);
