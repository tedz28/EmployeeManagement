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
        }
    };
}])
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
            });
    }
    getEmployees();

    $scope.orderByMe = function(x) {
        $scope.myOrderBy = x;
    };

});
