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
            .when('/detail', {
                templateUrl : 'templates/employeeDetail.html',
                controller : 'EmployeeDetailCtrl'
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
        }
    };
}])
.controller('EmployeeDetailCtrl', function($scope) {
    
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
        employeeFactory.addEmployee(employee);
        $location.path("#/");
    }
})
//employee list controller
.controller('EmployeeListCtrl', function($scope,employeeFactory) {
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

    //list sorting
    $scope.orderByMe = function(me) {
        $scope.myOrderBy = me;
    };

});
