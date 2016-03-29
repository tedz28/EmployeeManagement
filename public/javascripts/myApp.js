angular.module('myApp', ['ngRoute','infinite-scroll'])
//routing config
.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl : 'templates/employee_list.html',
                controller : 'EmployeeListCtrl'
            })
            .when('/new_employee', {
                templateUrl :'templates/newEmpolyee.html',
                controller : 'NewEmployeeCtrl'
            })
            .when('/:id', {
                templateUrl : 'templates/employeeDetail.html',
                controller : 'EmployeeDetailCtrl'
            })
            .when('/:id/reports', {
                templateUrl : 'templates/dirReports.html',
                controller : 'DirReportsCtrl'
            })
            .otherwise({
                redirectTo :  '/'
            });
    }])
//employee data factory
.factory('employeeFactory', ['$http',function($http) {
    return {
        getEmployees : function() {
            return $http.get('/employees');
        },
        addEmployee : function(data) {
            return $http.post('/employees',data);
        },
        getDirectReports : function(id) {
            return $http.get('/employees/' + id.toString() + '/reports');
        },
        getOneEmployee : function(id) {
            return $http.get('/employees/' + id.toString());
        },
        deleteEmployee : function(id) {
            return $http.delete('/employees/' + id.toString());
        }
    };
}])
.controller('DirReportsCtrl', function($scope, $routeParams, employeeFactory) {
    $scope.employees = [];
    employeeFactory.getDirectReports($routeParams.id)
        .then(function(res) {
            $scope.employees = res.data;
            if ($scope.employees.length == 0)
                {$scope.message = "Oops, this employee doesn't have any direct reports!";}
        });
})

//employee detail page
.controller('EmployeeDetailCtrl', function($scope, $location, $routeParams, employeeFactory) {
    $scope.employee = {};
    //get employee's detail
    employeeFactory.getOneEmployee($routeParams.id)
        .then(function(res) {
            $scope.employee = res.data;
        });
    $scope.editProfile = function() {

    };
    $scope.deleteProfile = function() {
        if($scope.employee._id) {
            employeeFactory.deleteEmployee($scope.employee._id)
                .then(function(res) {
                    $location.path("/");
                    console.log(res);
                }, function (err) {
                    console.log(err);
                    $location.path("/");
                });
        }
    };

})
//new employee controller
.controller('NewEmployeeCtrl', function($scope, $location, employeeFactory) {
    employeeFactory.getEmployees()
        .then(function(res){
           $scope.employees = res.data;
        });
    $scope.addEmployee = function() {
        var employee = {
            name : $scope.fName + " " + $scope.lName,
            title : $scope.title,
            sex   : $scope.sex,
            startDate : $scope.startDate,
            officePhone : $scope.officePhone,
            cellPhone : $scope.cellPhone,
            email : $scope.email
        };
        if($scope.manager != 'None') employee.manager = $scope.manager;
        employeeFactory.addEmployee(employee)
            .then(function(res) {
                $location.path("/");
                console.log(res);
            }, function(err) {
                $location.path("/");
                console.log(err);
            });

    }
})
//employee list controller
.controller('EmployeeListCtrl', function($scope,$location,employeeFactory) {
    //$scope.data = [];
    //let done = false;
    employeeFactory.getEmployees()
        .then(function(res) {
            //$scope.data = res.data;
            //$scope.employees = $scope.data.slice(0, 4);
            //done = true;
            $scope.employees = res.data;
        });

    $scope.getMore = function() {
        //if(done) $scope.employees = $scope.data.slice(0, $scope.employees.length + 2);
    };
    $scope.viewDetail = function(employee) {
        $location.path("/" + employee._id);
    };
    //list sorting
    $scope.orderByMe = function(me) {
        $scope.myOrderBy = me;
    };

});
