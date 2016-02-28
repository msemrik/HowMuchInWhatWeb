app.factory('alertsManager', function ($rootScope, $uibModal, $log) {
    return {
        alerts: {},
        addAlert: function (jsonMessage) {
            /*object = {
             Id: '', // For Passing a Movement Id
             Message: "Message Shown", //Shown Message
             Style: 'alert-danger', //Alert Style
             Movement: false //For showing see movement, and undo options
             };
             alertsManager.addAlert(object);
             */
            for (var x in this.alerts) {
                delete this.alerts[x];
            }
            this.alerts[jsonMessage.Style] = this.alerts[jsonMessage.Style] || [];
            this.alerts[jsonMessage.Style].push(jsonMessage);
        },
        clearAlerts: function () {
            for (var x in this.alerts) {
                delete this.alerts[x];
            }
        },
        showBootStrapModal: function (jsObject) {
            /*var jsError = {"title": "Error Retrieving data", "type": "error", "message": "Error Message", "stackTrace": "string"};
             alertsManager.showBootStrapModal(jsError); */
            for (var x in this.alerts) {
                delete this.alerts[x];
            }
            if ($rootScope.modalInstance != undefined) {
                $rootScope.message = $rootScope.message + "\n" + jsObject.message;
            }
            else {
                switch (jsObject.type) {
                    case 'error':
                        $rootScope.headerclass = 'modal-header modal-header-error';
                        $rootScope.bodyclass = 'modal-body modal-body-error';
                        $rootScope.footerclass = 'modal-footer modal-footer-error';

                        if (jsObject.stackTrace != undefined && jsObject.stackTrace.length > 0) {
                            $rootScope.stackTrace = jsObject.stackTrace;
                            $rootScope.isError = true;
                        }
                        else $rootScope.isError = false;

                        break;
                    case 'success':
                        $rootScope.headerclass = 'modal-header modal-header-success';
                        $rootScope.bodyclass = 'modal-body modal-body-success';
                        $rootScope.footerclass = 'modal-footer modal-footer-success';
                        $rootScope.isError = false;
                        break;
                }
                $rootScope.showStackTrace = false;
                $rootScope.title = jsObject.title;
                $rootScope.message = jsObject.message;
                $rootScope.modalInstance = $uibModal.open({
                    size: 'lg',
                    animation: true,
                    templateUrl: 'pages/templates/modalTemplate.html',
                    scope: $rootScope
                });

                $rootScope.ok = function () {
                    $rootScope.modalInstance.dismiss('cancel');
                    $rootScope.modalInstance = undefined;
                };

                $rootScope.showHideStackTrace = function () {
                    $rootScope.showStackTrace = !$rootScope.showStackTrace;
                };
                $rootScope.copytoClipboard = function (text) {
                    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
                };
            }
        },


        currencyCotization: function (jsObject) {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'pages/templates/cotizationTemplate.html',
                controller: 'CotizationInstanceCtrl as i',
                size: 'sm',
                backdrop: false,
                //scope: $scope,
                resolve: {
                    jsObject: function () {
                        return jsObject;
                    }
                }
            });
            return modalInstance;
        }


    }
        ;
});


app.controller('CotizationInstanceCtrl', function ($scope, $uibModalInstance, jsObject) {

    var instance = this;

    $scope.headerclass = 'modal-header modal-header-currency';
    $scope.bodyclass = 'modal-body modal-body-currency';
    $scope.footerclass = 'modal-footer modal-footer-currency';

    $scope.title = jsObject.title;


    $scope.normalCotization = true;
    $scope.movementCurrency = jsObject.movementCurrency.symbol;
    $scope.currencyToCotize = jsObject.currencyToCotize.symbol;
    $scope.cotizationValue = 1.00;


    $scope.ok = function () {
        if ($scope.cotizationValue == undefined || $scope.cotizationValue < 0.1)
            alert("Error! You must insert a valid cotization value.")
        else {
            if(!$scope.normalCotization)
                $scope.cotizationValue = 1 / $scope.cotizationValue;
            $uibModalInstance.close($scope.cotizationValue);
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.close(undefined);

    };


    $scope.changeCurrency = function () {
        $scope.normalCotization = !$scope.normalCotization;
        temp = $scope.movementCurrency;
        $scope.movementCurrency = $scope.currencyToCotize;
        $scope.currencyToCotize = temp;
    };
});