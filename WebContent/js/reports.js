var reportsApp = angular.module('myApp');

reportsApp.controller('reportsCtrl', ['$scope', function ($scope) {

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "December"];
    $scope.series = ['Sign Up', 'Requests', 'Leases'];
    $scope.data = [
    [65, 59, 80, 81, 56, 55, 40, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90, 81, 56, 55, 40],
    [78, 78, 90, 89, 36, 77, 50, 31, 36, 75, 20]
  ];
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
