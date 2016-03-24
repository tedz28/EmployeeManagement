angular.module('myApp', ['ngRoute'])
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
        }
    };
}])
.controller('DirReportsCtrl', function($scope, $routeParams, employeeFactory) {
    $scope.employees = [];
    employeeFactory.getDirectReports($routeParams.id)
        .then(function(res) {
            var ids = res.data;
            if(ids.reports.length == 0)
                $scope.message = "Oops, this employee doesn't have any direct reports!";
            //for of syntax, es6 support needed
            for(var id of ids.reports) {
                for(var item of $scope.$parent.employees) {
                    if(id === item._id) $scope.employees.push(item);
                }
                // employeeFactory.getOneEmployee(id)
                //     .then(function(response) {
                //         $scope.employees.push(response.data);
                //     })
            }
        });
})

//employee detail page
.controller('EmployeeDetailCtrl', function($scope, $location, $routeParams, employeeFactory) {
    $scope.employee = {};

    // //testing function for Array.find()
    // function findEmployeeById (item) {
    //     return item._id  === $routeParams.id;
    // }
    // if($scope.$parent.employees){
    //     //es6 Array.find()
    //     $scope.employee = $scope.$parent.employees.find(findEmployeeById);
    // }

    //get employee's detail and also retrieve its manager's detail
    employeeFactory.getOneEmployee($routeParams.id)
        .then(function(res) {
            $scope.employee = res.data;
            $scope.managerId = $scope.employee.manager;
            if($scope.managerId) {
                employeeFactory.getOneEmployee($scope.managerId)
                .then(function(response) {
                    $scope.manager = response.data;
                });
            }
        });
    employeeFactory.getDirectReports($routeParams.id)
        .then(function(res) {
            $scope.employee.dirReports = res.data;
            //console.log($scope.employee);
        });

})
//new employee controller
.controller('NewEmployeeCtrl', function($scope, $location, employeeFactory) {
    $scope.addEmployee = function() {
        var employee = {
            name : $scope.name,
            title : $scope.title,
            sex   : $scope.sex,
            startDate : $scope.startDate,
            officePhone : $scope.officePhone,
            cellPhone : $scope.cellPhone,
            email : $scope.email,
            manager : $scope.manager,
        };
        employeeFactory.addEmployee(employee)
            .then(function(res) {
                $location.path("/");
            }, function(err) {
                $location.path("/");
            });

    }
})
//employee list controller
.controller('EmployeeListCtrl', function($scope,$location,employeeFactory) {
    function getEmployees() {
        employeeFactory.getEmployees()
            .then(function(res) {
                $scope.employees = res.data;
                //calculate direct reports for each employee
                //and set to employee.dirReports(array of ids)
                $scope.employees.forEach(function(item) {
                    employeeFactory.getDirectReports(item._id)
                        .then(function(res) {
                            item.dirReports = res.data;
                        });
                });
            });
    }
    getEmployees();

    $scope.viewDetail = function(employee) {
        $location.path("/" + employee._id);
        console.log(employee);
    }
    //list sorting
    $scope.orderByMe = function(me) {
        $scope.myOrderBy = me;
    };

});
