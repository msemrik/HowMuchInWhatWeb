app.controller("TabController", function ($scope, $http, $rootScope, PromiseUtils, $cookies,alertsManager) {

    var tab = this;
    tab.selectedTab = 1;


    tab.radioModel = {
        login: false,
        movement: false,
        report: false,
        cotization: false,
        logout: false
    };
    tab.resetTabValues = function(){
        tab.radioModel = {
            login: false,
            movement: false,
            report: false,
            cotization: false,
            logout: false
        };
        $rootScope.$emit("resetReportTab");

    }


    $scope.setSelected = function (value, outsidePassedObject, type) {
        tab.selectedTab = value;
        tab.resetTabValues();
        alertsManager.clearAlerts();
        if (tab.selectedTab == 1) {
            tab.radioModel.movement = true;
            $rootScope.$emit("initializeMovementTab", outsidePassedObject);
        }
        if (tab.selectedTab == 2 ){
            tab.radioModel.report = true;
            $rootScope.$emit("initializeReportTab", outsidePassedObject, type);
        }
    }

    $scope.isSelected = function (value) {
        return (tab.selectedTab === value);
    }

    $rootScope.$on("setSelectedFromOutside", function (event, args) {
        $scope.setSelected(args.tab);
    });





    $rootScope.$on("loadMovementFromOutside", function (event, args) {
        $scope.setSelected(1, args);
    });

    $rootScope.$on("loadReportFromOutside", function (event, object, reportType) {
        $scope.setSelected(2, object, reportType);
    });


});

