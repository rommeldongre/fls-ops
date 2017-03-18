var reportsApp = angular.module('myApp');

reportsApp.controller('reportsCtrl', ['$scope', 'reportsApi', '$filter', function ($scope, reportsApi, $filter) {

    $scope.fromDate = new Date();
    $scope.fromDate.setDate($scope.fromDate.getDate() - 7 * 10);
    $scope.toDate = new Date();

    $scope.isCumulative = true;

    $scope.freq = 'MONTHLY';

    $scope.reports = [
        {
            display: false,
            name: '',
            data: [],
            cumulativeData: [],
            color: "#9C27B0"
        },
        {
            display: true,
            name: '',
            data: [],
            cumulativeData: [],
            color: "#f44336"
        },
        {
            display: false,
            name: '',
            data: [],
            cumulativeData: [],
            color: "#8BC34A"
        },
        {
            display: false,
            name: '',
            data: [],
            cumulativeData: [],
            color: "#2196F3"
        },
        {
            display: true,
            name: '',
            data: [],
            cumulativeData: [],
            color: "#FFEB3B"
        },
        {
            display: false,
            name: '',
            data: [],
            cumulativeData: [],
            color: "#9E9E9E"
        }
    ];

    var generateReport = function () {
        reportsApi.getReport({
            report: 'USER_TRACTION',
            freq: $scope.freq,
            from: $filter('date')(new Date(Date.parse($scope.fromDate)), 'yyyy-MM-dd'),
            to: $filter('date')(new Date(Date.parse($scope.toDate)), 'yyyy-MM-dd')
        }).then(
            function (response) {
                var res = response.data;
                var format = 'd MMM yy';
                if($scope.freq == 'MONTHLY')
                    format = 'MMMM';
                res.labels.forEach(function(label, index, labels){
                    if(index == 0)
                        labels[index] = "<" + $filter('date')(new Date(Date.parse(label)), format);
                    else
                        labels[index] = $filter('date')(new Date(Date.parse(label)), format);
                });
                $scope.labels = res.labels;

                res.series.forEach(function(name, index){
                    $scope.reports[index].name = name;
                    $scope.reports[index].data = angular.copy(res.data[index]);
                    $scope.reports[index].cumulativeData = calcCumulative(angular.copy(res.data[index]));
                });

                createReport();
            },
            function (error) {
                console.log(error);
            }
        );
    };

    var calcCumulative = function(arr) {
        var total = 0;
        arr.forEach(function(c, i) {
            total = total + c;
            arr[i] = total;
        });
        return arr;
    }

    var createReport = function() {
        $scope.series = [];
        $scope.data = [];
        $scope.cumulativeData = [];
        $scope.colors = [];
        $scope.reports.forEach(function(report, index){
            if(report.display) {
                $scope.series.splice(index, 0, report.name);
                $scope.data.splice(index, 0, report.data);
                $scope.cumulativeData.splice(index, 0, report.cumulativeData);
                $scope.colors.splice(index, 0, report.color);
            }
        });
    }

    $scope.changeDisplay = function(index) {
        $scope.reports[index].display = !$scope.reports[index].display;
        createReport();
    }

    $scope.plot = function() {
        generateReport();
    }

    generateReport();

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

}]);

reportsApp.service('reportsApi', ['$http', function ($http) {

    this.getReport = function (req) {
        return $http.post('/GetReport', JSON.stringify(req));
    }

}]);
