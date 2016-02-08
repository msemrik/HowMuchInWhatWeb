app.controller("MainController", function ($q, $http, $scope, $rootScope, $location, $timeout, $cookies, alertsManager, PromiseUtils) {

    var vm = this;
    vm.title = 'Accounting System';
    $scope.credentials = {};


    var authenticate = function (credentials, callback) {
        $scope.logoutMessage = false;

        var headers = credentials ? {
            authorization: "Basic " + btoa(credentials.username + ":" + credentials.password)
        } : {};

        var anyCall = $http({
            method: 'GET',
            url: 'http://localhost:8090/user',
            headers: headers,
            withCredentials: true
        });

        PromiseUtils.getPromiseHttpResult(anyCall).then(function (result) {
            if (result.name) {
                $rootScope.authenticated = true;
                var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};
                var anyCall = $http({
                    method: 'GET',
                    url: 'http://localhost:8090/resource/',
                    headers: headers,
                    withCredentials: true
                });

                PromiseUtils.getPromiseHttpResult(anyCall).then(function (result) {

                    $timeout(function () {
                        $rootScope.$broadcast("setSelectedFromOutside", {tab: 2});
                    }, 100);


                });

            } else {
                $rootScope.authenticated = false;

                $rootScope.$broadcast("setSelectedFromOutside", {tab: 0});
            }
            callback && callback($rootScope.authenticated);
            ;
        }, function (arguments) {
            object = {
                Message: "There was a problem logging in. Please try again.",
                Style: 'alert-danger',
                Movement: false
            };
            alertsManager.addAlert(object)
            $rootScope.authenticated = false;
            $rootScope.$broadcast("setSelectedFromOutside", {tab: 0});
            callback && callback(false);
        })


    }


    $rootScope.$on('authenticateConnection', function (event, idMov) {
        authenticate();
    });

    authenticate();



    $scope.login = function () {
        authenticate($scope.credentials, function (authenticated) {
            if (authenticated) {
                console.log("Login succeeded")
                $scope.error = false;
                $rootScope.authenticated = true;
            } else {
                console.log("Login failed")
                $scope.error = true;
                $rootScope.authenticated = false;
                object = {
                    Message: "There was a problem logging in. Please try again.",
                    Style: 'alert-danger',
                    Movement: false
                };
                alertsManager.addAlert(object)

            }
        })
    };




    $scope.logout = function () {
        object = {
            Message: " You had successfully Logged Out.",
            Style: 'alert-success',
            Movement: false
        };
        var url = 'http://localhost:8090/logout';
        $http({
            method: 'POST',
            url: url,
            headers: {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')},
            withCredentials: true
        }).success(function () {
            alertsManager.addAlert(object)
            $rootScope.authenticated = false;
            $location.path("/");
        }).error(function (data) {
            alertsManager.addAlert(object)
            $rootScope.authenticated = false;
        });
    }
});

