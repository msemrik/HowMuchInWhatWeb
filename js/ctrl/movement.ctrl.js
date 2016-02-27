app.controller("MovementController", function ($scope, $http, PromiseUtils, alertsManager, $rootScope, $cookies) {

    var mv = this;

    $rootScope.$on('initializeMovementTab', function (event, movement) {
        mv.initializeTab(movement);
    });

    $rootScope.$on('undoMovement', function (event, idMov) {
        mv.undoMovement(idMov)
    });

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////             Main Functionality            ///////////////////
    ///////////////////////////////////////////////////////////////////////////////
    mv.initializeTab = function (movement) {

        mv.outSideMovement.Movement = movement;
        mv.numberOfWaitingCalls = 0;

        mv.scrollWindow("#header");

        var jsError = {"title": "Error Retrieving data", "type": "error"};

        var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};
        var categoriesCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getCategories',
            headers: headers,
            withCredentials: true
        });
        mv.activeCall('+');
        PromiseUtils.getPromiseHttpResult(categoriesCall)
            .then(function (result) {
                resultJson = angular.fromJson(result.body);
                if (result.statusCode == "OK") {
                    mv.categories = resultJson.object;
                } else {
                    jsError["message"] = resultJson.message;
                    jsError["stackTrace"] = resultJson.stackTrace;
                    alertsManager.showBootStrapModal(jsError);
                }
                mv.activeCall('-');
            }, function (arguments) {
                jsError["message"] = "Connection Error, please retry.";
                alertsManager.showBootStrapModal(jsError)
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
                mv.activeCall('-');

            })


        var accountsCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getAccounts',
            headers: headers,
            withCredentials: true
        });
        mv.activeCall('+');
        PromiseUtils.getPromiseHttpResult(accountsCall)
            .then(function (result) {
                resultJson = angular.fromJson(result.body);
                if (result.statusCode == "OK") {
                    mv.destinationAccounts = resultJson.object;
                    mv.originAccounts = mv.destinationAccounts;
                } else {
                    jsError["message"] = resultJson.message;
                    jsError["stackTrace"] = resultJson.stackTrace;
                    alertsManager.showBootStrapModal(jsError);
                }
                mv.activeCall('-');
            }, function (arguments) {
                jsError["message"] = "Connection Error, please retry.";
                alertsManager.showBootStrapModal(jsError)
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
                mv.activeCall('-');
            })


        var currenciesCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getCurrencies',
            headers: headers,
            withCredentials: true
        });
        mv.activeCall('+');
        PromiseUtils.getPromiseHttpResult(currenciesCall)
            .then(function (result) {
                resultJson = angular.fromJson(result.body);
                if (result.statusCode == "OK") {
                    mv.currencies = resultJson.object;
                } else {
                    jsError["message"] = resultJson.message;
                    jsError["stackTrace"] = resultJson.stackTrace;
                    alertsManager.showBootStrapModal(jsError);
                }
                mv.activeCall('-');
            }, function (arguments) {
                jsError["message"] = "Connection Error, please retry.";
                alertsManager.showBootStrapModal(jsError)
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
                mv.activeCall('-');
            })


        mv.date = new Date();
        mv.actualDate = true;

        mv.amount = '';
        mv.comment = '';
    };


    mv.getDetails = function (selectedDetail) {

        if (mv.selectedCategory != mv.preCategory) {
            var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};
            var detailsCall = $http({
                method: 'POST',
                url: 'http://localhost:8090/getDetails',
                headers: headers,
                withCredentials: true,
                data: JSON.stringify({"id": mv.selectedCategory.id, "name": mv.selectedCategory.name})
            });
            PromiseUtils.getPromiseHttpResult(detailsCall)
                .then(function (result) {
                    resultJson = angular.fromJson(result.body);
                    if (result.statusCode == "OK") {
                        mv.details = resultJson.object;
                        if (selectedDetail != undefined) {
                            mv.selectedDetail = mv.getElement(mv.details, selectedDetail);
                        }
                        else {
                            mv.selectedDetail = mv.details[0];
                        }
                    } else {
                        jsError["message"] = resultJson.message;
                        jsError["stackTrace"] = resultJson.stackTrace;
                        alertsManager.showBootStrapModal(jsError);
                    }
                }, function (arguments) {
                    jsError["message"] = "Connection Error, please retry.";
                    alertsManager.showBootStrapModal(jsError);
                    if (arguments[0] == null || arguments[0].status == 403) {
                        $rootScope.$broadcast("authenticateConnection");
                    }
                })
            mv.preCategory = mv.selectedCategory

        }

    }


    mv.addNewMovement = function () {

        if (mv.actualDate) {
            date = new Date();
        }
        var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};

        var newMVCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/createMovement',
            headers: headers,
            withCredentials: true,
            data: JSON.stringify({
                "origAccount": mv.selectedOriginAccount.id,
                "destAccount": mv.selectedDestinationAccount.id,
                "amount": mv.amount,
                "currency": mv.selectedCurrency.id,
                "movementDate": mv.date,
                "isActualDate": mv.actualDate,
                "category": mv.selectedCategory.id,
                "detail": mv.selectedDetail.id,
                "comment": mv.comment
            })
        });
        PromiseUtils.getPromiseHttpResult(newMVCall)
            .then(function (result) {
                resultJson = angular.fromJson(result.body);
                if (result.statusCode == "OK") {
                    object = {
                        Id: resultJson.object,
                        Message: "Movement Successfully Saved",
                        Style: 'alert-success',
                        Movement: true
                    };
                    alertsManager.addAlert(object);
                }
                else {
                    var jsError = {
                        "title": "Error Creating Movement",
                        "type": "error",
                        "message": resultJson.message,
                        "stackTrace": resultJson.stackTrace
                    };
                    alertsManager.showBootStrapModal(jsError);
                }
            }, function (arguments) {
                var jsError = {
                    "title": "Error Creating Movement",
                    "type": "error",
                    "message": "Connection Error, please retry."
                };
                alertsManager.showBootStrapModal(jsError);
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })
    };


    mv.undoMovement = function (movId) {
        date = new Date();
        var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};

        var deleteMVCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/deleteMovement',
            headers: headers,
            withCredentials: true,
            params: {movId: movId}
        });
        PromiseUtils.getPromiseHttpResult(deleteMVCall)
            .then(function (result) {
                resultJson = angular.fromJson(result.body);
                if (result.statusCode == "OK") {
                    object = {
                        Id: resultJson.id,
                        Message: resultJson.message,
                        Style: 'alert-success',
                        Movement: false
                    };
                    alertsManager.addAlert(object);

                }
                else {
                    var jsError = {
                        "title": "Error Creating Movement",
                        "type": "error",
                        "message":  resultJson.message,
                        "stackTrace": resultJson.stackTrace
                    };
                    alertsManager.showBootStrapModal(jsError);
                }
            }, function (arguments) {
                var jsError = {
                    "title": "Error Creating Movement",
                    "type": "error",
                    "message": "Connection Error, please retry.",
                };
                alertsManager.showBootStrapModal(jsError);
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })
    }


    mv.getElement = function (array, element) {
        var returnObject;
        for (var i = 0; i < array.length; i++) {
            if (array[i].id == element.id) {
                returnObject = array[i];
                break;
            }
        }
        return returnObject;
    }


    mv.exchangeAccounts = function () {
        var temp;
        temp = (mv.selectedOriginAccount != undefined) ? mv.selectedOriginAccount : null;
        mv.selectedOriginAccount = (mv.selectedDestinationAccount != undefined) ? mv.selectedDestinationAccount : null;
        mv.selectedDestinationAccount = temp;
    }


    mv.openAccount = function (account) {

        if (mv.originAccounts.indexOf(account) != -1) {
            $rootScope.$emit('loadReportFromOutside', account, 'account');
        }
        else {
            var jsError = {
                "title": "Error Creating Account Report",
                "type": "error",
                "message": "Please, select an account."
            };
            alertsManager.showBootStrapModal(jsError)
        }
    }


    mv.scrollWindow = function (scrollTo) {
        $('html, body').animate({scrollTop: $(scrollTo).offset().top}, 500);
    }


    ///////////////////////////////////////////////////////////////////////////////
    /////////////////               OutSide Filter              ///////////////////
    ///////////////////////////////////////////////////////////////////////////////

    mv.currentlyActiveCalls = 0;

    mv.activeCall = function (state) {
        if (state == '+') {
            mv.currentlyActiveCalls++;
        }
        else {
            mv.currentlyActiveCalls--;
        }
        if (mv.currentlyActiveCalls == 0) {
            mv.checkOutSideMovementFilter();
        }
    }

    mv.outSideMovement = {
        Movement: undefined
    }

    mv.checkOutSideMovementFilter = function () {
        if (mv.outSideMovement.Movement != undefined) {
            mv.selectedOriginAccount = mv.getElement(mv.originAccounts, mv.outSideMovement.Movement.origAccount);
            mv.selectedDestinationAccount = mv.getElement(mv.destinationAccounts, mv.outSideMovement.Movement.destAccount);
            mv.selectedCategory = mv.getElement(mv.categories, mv.outSideMovement.Movement.detail.category);
            mv.getDetails(mv.outSideMovement.Movement.detail);
            mv.amount = mv.outSideMovement.Movement.amount;
            mv.selectedCurrency = mv.getElement(mv.currencies, mv.outSideMovement.Movement.currency);
            mv.comment = mv.outSideMovement.Movement.commentary;

            mv.outSideMovement.Movement = undefined;

        } else {
            mv.selectedCategory = mv.categories[0];
            mv.getDetails();
            mv.selectedDestinationAccount = mv.destinationAccounts [0];
            mv.selectedOriginAccount = mv.originAccounts[1];
            mv.selectedCurrency = mv.currencies[0];
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    /////////////////                  Pick Date                ///////////////////
    ///////////////////////////////////////////////////////////////////////////////
    mv.openCalendar = function () {
        mv.openedPopUp = true;
    }
    $scope.today = function () {
        mv.date = new Date();
    };
    $scope.clear = function () {
        mv.date = null;
    };
    mv.isValidDate = function (date) {
        if (date != undefined) return true;
        return false;
    }

    $scope.format = 'dd/MM/yyyy';
    mv.minDate = new Date(1800, 1, 1);
    mv.maxDate = new Date();


    mv.updateDate = function (event, id, button) {
        mv.actualDate = !mv.actualDate;
        if (event.currentTarget.firstChild.textContent.indexOf("Past Date") != -1) {
            event.currentTarget.firstChild.textContent = "Actual Date"
            $("#date").attr('required', true);
        }
        else {
            event.currentTarget.firstChild.textContent = "Past Date"
            mv.date = new Date();
            $("#date").removeAttr('required');
        }
    };


});

