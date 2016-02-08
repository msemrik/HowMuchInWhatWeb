app.controller('reportController', function (NgTableParams, $anchorScroll, $location, $filter, $http, PromiseUtils, alertsManager, modalManager, $scope, $rootScope, $cookies, $timeout) {

    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////         Initialization and Common Code         ////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////


    var rp = this;

    rp.tabStatus = {
        isAccountReportOpen: false,
        isMovementReportOpen: false
    };

    $rootScope.$on('initializeReportTab', function (event, object, type) {
        rp.restartEveryReport();

        if (type == 'movement') {

            if (object != undefined) {
                rp.outSidefilter.MovementId = object;
            }
            rp.tabStatus.isMovementReportOpen = true;
        } else {

            if (object != undefined) {
                rp.outSidefilter.Account = object;
            }
            rp.tabStatus.isAccountReportOpen = true;
        }
        rp.scrollWindow("body");
    });


    $rootScope.$on('resetReportTab', function (event) {
        rp.restartEveryReport();
    });



    $scope.$watch('rp.tabStatus.isAccountReportOpen', function (isOpen) {
        if (isOpen) {
            rp.initializeAccountReportTab()
        }
        else {
            if (rp.everyReportIsClosed())
                rp.scrollWindow("body");
            rp.restartAccountReport();
        }
    });


    $scope.$watch('rp.tabStatus.isMovementReportOpen', function (isOpen) {
        if (isOpen) {
            rp.initializeMovementReportTab();
        }
        else {
            if (rp.everyReportIsClosed())
                rp.scrollWindow("body");
            rp.restartMovementReport(true);
        }
    });


    rp.restartEveryReport = function () {
        rp.restartAccountReport();
        rp.restartMovementReport();
        rp.tabStatus.isAccountReportOpen = false;
        rp.tabStatus.isMovementReportOpen = false
    }


    rp.everyReportIsClosed = function () {
        return !rp.tabStatus.isAccountReportOpen && !rp.tabStatus.isMovementReportOpen;
    }

    rp.scrollWindow = function (scrollTo) {
        $('html, body').animate({scrollTop: $(scrollTo).offset().top}, 500);
    }



    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////                Account Report                  ////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////


    rp.initializeAccountReportTab = function () {
        rp.scrollWindow("#accountReportAccordion");

        rp.selectedAccountForAccountReport = '';
        rp.showedAccountForAccountReport = '';

        var jsError = {"title": "Error Retrieving data", "type": "error"};
        var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};

        var accountsCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getAccounts',
            headers: headers,
            withCredentials: true
        });

        PromiseUtils.getPromiseHttpResult(accountsCall)
            .then(function (result) {
                rp.accounts = result;
            }, function (arguments) {
                jsError["message"] = "Error getting Accounts";
                alertsManager.showBootStrapModal(jsError)
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })


        var currenciesCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getCurrencies',
            headers: headers,
            withCredentials: true
        });

        PromiseUtils.getPromiseHttpResult(currenciesCall)
            .then(function (result) {
                rp.currencies = result;
                $.each(rp.currencies, function (index, currency) {
                    currency["selected"] = true;
                });
            }, function (arguments) {
                jsError["message"] = "Error getting Currencies";
                alertsManager.showBootStrapModal(jsError);
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })


        rp.sadders = [
            {id: 1, symbol: '=>0', text: 'greater', selected: true},
            {id: 2, symbol: '=<0', text: 'lesser', selected: true}
        ];

        rp.accountsType = [
            {id: 1, text: 'Countable Account', selected: true},
            {id: 2, text: 'Bank Account', selected: true},
            {id: 3, text: 'Person', selected: true}
        ];

        rp.restartAccountReport();
        rp.checkOutSideAccountFilter()


    }

    rp.pointInfo = [[]];
    rp.infoLabel = [];
    rp.infoData = [];
    rp.labels = [];
    rp.data = [[]];

    rp.getAccountReport = function () {
        rp.pointInfo = [[]];
        rp.infoLabel = [];
        rp.infoData = [];
        rp.labels = [];
        rp.data = [[]];
        var jsError = {"title": "Error Creating Report", "type": "error"};
        var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};

        var reportCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getAccountReport',
            headers: headers,
            withCredentials: true,
            params: {"accountId": rp.selectedAccountForAccountReport.id}
        });
        rp.showedAccountForAccountReport = rp.selectedAccountForAccountReport;


        PromiseUtils.getPromiseHttpResult(reportCall)
            .then(function (result) {
                resultJson = angular.fromJson(result.body);
                if (result.statusCode == "OK") {
                    resultJson = resultJson.object;
                    if (resultJson.accountSadderGraph != undefined) {
                        rp.labels = resultJson.accountSadderGraph.stringDateList;
                        rp.data = [resultJson.accountSadderGraph.sadderList];
                        rp.pointInfo = resultJson.accountSadderGraph.pointInfo;
                    }

                    rp.infoLabel = resultJson.accountInformation.labelList;
                    rp.infoData = resultJson.accountInformation.dataList;

                    rp.series = ['Account History Sadder'];
                }
                else {
                    jsError["message"] = "Error getting Report. Error: " + result.message;
                    alertsManager.showBootStrapModal(jsError)
                }
            }, function (arguments) {
                jsError["message"] = "Error getting Report";
                alertsManager.showBootStrapModal(jsError)
            })
    };


    rp.restartAccountReport = function () {
        rp.showedAccountForAccountReport = '';
        rp.selectedAccountForAccountReport = '';
        rp.labels = [];
        rp.data = [[]];
        rp.infoLabel = '';
        rp.infoData = '';
        rp.pointInfo = [[]];

    }


    rp.reportLastMovements = function () {
        rp.outSidefilter.Account = rp.showedAccountForAccountReport;
        rp.tabStatus.isMovementReportOpen = true;
    }


    rp.accountIsInArray = function (account, accounts) {
        if (account != undefined && accounts != undefined) {
            var result;
            result = $filter('filter')(accounts, function (d) {
                if (d.id === account.id) {
                    return true;
                }
            });
            if (result.length > 0) {
                return true;
            }
        }
        return false;
    }
//////////////////////////////////////////////////////////////////
//////////////////////        Chart.js      //////////////////////
//////////////////////////////////////////////////////////////////

    Chart.defaults.global.pointHitDetectionRadius = 0;

    rp.options = {
        // Sets the chart to be responsive
        responsive: true,
        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius: 0,
        tooltipTemplate: function (label, data, index) {
            var index = rp.labels.indexOf(label.label);
            return rp.pointInfo[index];
        }
    };

    $scope.onClick = function (points, evt) {
        rp.filterMovementByMonth(points[0].label);

    };
    //Hack to avoid chart from flicking with old data
    $scope.$on('create', function (event, chart) {
        if (typeof $chart !== "undefined") {
            $chart.destroy();
        }

        $chart = chart;
    });


    ///////////////////////////////////////////////////////////////////////////////
    /////////////////           Account  Report Filter          ///////////////////
    ///////////////////////////////////////////////////////////////////////////////


    rp.openAccountFilter = function () {
        modalManager.toggleModalWindow();
        rp.isAccountFilterShown = true;
        $('html, body').animate({scrollTop: $("#accountReportFilter").offset().top}, 1000);
    };

    rp.closeAccountFilter = function () {
        modalManager.toggleModalWindow();
        $('html, body').animate({scrollTop: $("#accountReportAccordion").offset().top}, 1000);
        rp.isAccountFilterShown = false;
    };



    rp.filterMovementByMonth = function (month) {
        reportDate = month.split('/');
        rp.outSidefilter.MinDate = new Date(reportDate[1], reportDate[0] - 1, 1);
        rp.outSidefilter.MaxDate = new Date(reportDate[1], reportDate[0], 0);
        rp.outSidefilter.Account = rp.selectedAccountForAccountReport;
        rp.tabStatus.isMovementReportOpen = true;
    }


    rp.filterAccounts = function (value, index, array) {

        //Filter by Currency
        var result;
        result = $filter('filter')(rp.currencies, function (d) {
            if ((d.symbol === value.currency.symbol) && (d.selected)) {
                return true;
            }
        });
        if (result.length == 0) {
            return false;
        }

        //Filter by Sadder
        result = $filter('filter')(rp.sadders, function (d) {
            if (d.selected) {
                if ((d.text == 'greater' && value.accountSadder >= 0) || (d.text == 'lesser' && value.accountSadder <= 0)) {
                    return true;
                }
            }
        });
        if (result.length == 0) {
            return false;
        }

        //Filter by TypeOfAccount
        result = $filter('filter')(rp.accountsType, function (d) {
            if (d.selected && (d.text == value.typeOfAccount)) {
                return true;
            }

        });
        if (result.length == 0) {
            return false;
        }


        return true;
    };


    ////////////////////////////////////////////////////////////////////////////////
    /////////////////           Outside Account Report           ///////////////////
    ///////////////////////////////////////////////////////////////////////////////


    rp.outSidefilter = {
        Account: undefined,
    }


    rp.checkOutSideAccountFilter = function () {
        var shouldSubmit = false;
        if (rp.outSidefilter.Account != undefined) {

            result = $filter('filter')(rp.accounts, function (d) {
                if ((d.name === rp.outSidefilter.Account.name)) {
                    rp.showedAccountForAccountReport = d;
                    rp.selectedAccountForAccountReport = d;
                    return true;
                }
            });
            if (result.length > 0) {
                shouldSubmit = true;
            }
            rp.outSidefilter.Account = undefined;
        }

        if (shouldSubmit) {
            rp.getAccountReport();
        }
    }


/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////               Movment Report                   ////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


    rp.initializeMovementReportTab = function () {
        rp.scrollWindow("#accountReportAccordion");

        rp.selectedAccountForMovementReport = [];

        var jsError = {"title": "Error Retrieving data", "type": "error"};
        var headers = {'X-XSRF-TOKEN': $cookies.get('XSRF-TOKEN')};

        var accountsCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getAccounts',
            headers: headers,
            withCredentials: true
        });

        PromiseUtils.getPromiseHttpResult(accountsCall)
            .then(function (result) {
                rp.accounts = result;
                $.each(rp.accounts, function (index, account) {
                    account["origSelected"] = true;
                    account["destSelected"] = true;
                });
            }, function (arguments) {
                jsError["message"] = "Error getting Accounts";
                alertsManager.showBootStrapModal(jsError)
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })


        var currenciesCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getCurrencies',
            headers: headers,
            withCredentials: true
        });

        PromiseUtils.getPromiseHttpResult(currenciesCall)
            .then(function (result) {
                rp.currencies = result;
                $.each(rp.currencies, function (index, currency) {
                    currency["selected"] = true;
                });
            }, function (arguments) {
                jsError["message"] = "Error getting Currencies";
                alertsManager.showBootStrapModal(jsError);
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })

        var categoriesCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getCategoriesList',
            headers: headers,
            withCredentials: true
        });

        PromiseUtils.getPromiseHttpResult(categoriesCall)
            .then(function (result) {
                rp.categories = result;
                $.each(rp.categories, function (index, category) {
                    category['selected'] = false;
                    $.each(category.details, function (index, detail) {
                        detail['selected'] = true;
                    });
                });
            }, function (arguments) {
                jsError["message"] = "Error getting Categories";
                alertsManager.showBootStrapModal(jsError);
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })


        rp.sadders = [
            {id: 1, symbol: '=>0', text: 'greater', selected: true},
            {id: 2, symbol: '=<0', text: 'lesser', selected: true}
        ];

        rp.accountsType = [
            {id: 1, text: 'Countable Account', selected: true},
            {id: 2, text: 'Bank Account', selected: true},
            {id: 3, text: 'Person', selected: true}
        ];


        var reportCall = $http({
            method: 'POST',
            url: 'http://localhost:8090/getMovementsReport',
            headers: headers,
            withCredentials: true,
            params: {"orderDesc": true}
        })


        PromiseUtils.getPromiseHttpResult(reportCall)
            .then(function (result) {
                resultJson = angular.fromJson(result.body);
                if (result.statusCode == "OK") {
                    resultJson = resultJson.object;
                    rp.movement = resultJson.movements;
                    $.each(rp.movement, function (index, movement) {
                        movement.selected = false;
                    });
                    rp.tableParams = new NgTableParams({
                        page: 1,
                        count: 10
                    }, {
                        total: rp.movement.length,
                        getData: function ($defer, params) {
                            rp.data = $filter('filter')(rp.movement, rp.filterMovement);
                            rp.data = params.sorting() ? $filter('orderBy')(rp.data, params.orderBy()) : rp.data;
                            params.total(rp.data.length);
                            rp.data = rp.data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                            $defer.resolve(rp.data);
                        }
                    });
                    rp.checkOutSideMovementFilter();
                }
                else {
                    jsError["message"] = "Error getting Report. Error: " + result.message;
                    alertsManager.showBootStrapModal(jsError)
                }
            }, function (arguments) {
                jsError["message"] = "Error getting Report";
                alertsManager.showBootStrapModal(jsError)
                if (arguments[0] == null || arguments[0].status == 403) {
                    $rootScope.$broadcast("authenticateConnection");
                }
            })
    }




    rp.openAccountReport = function (account) {
        if (account != undefined) {
            rp.outSidefilter.Account = account;
            rp.tabStatus.isAccountReportOpen = true;
        }
    }

    rp.reDoMovement = function (movement) {
        $rootScope.$emit('loadMovementFromOutside', movement);
    }

    rp.refreshMovementReport = function () {
        rp.tableParams.reload();
    }

    rp.restartMovementReport = function (closeFilter) {
        rp.resetMovementReportFilter();
        rp.tableParams = new NgTableParams({});

    }

///////////////////////////////////////////////////////////////////////////////
/////////////////           Movement Report Filter          ///////////////////
///////////////////////////////////////////////////////////////////////////////

    rp.movementFilter = {minAmount: '', maxAmount: '', minDate: '', maxDate: ''};

    rp.openMovementFilter = function () {
        modalManager.toggleModalWindow();
        rp.isMovementFilterShown = true;
        $('html, body').animate({scrollTop: $("#movementReportFilter").offset().top}, 1000);
    };

    rp.closeMovementFilter = function () {
        modalManager.toggleModalWindow();
        rp.refreshMovementReport();
        $('html, body').animate({scrollTop: $("#movementReportAccordion").offset().top}, 1000);
        rp.isMovementFilterShown = false;
    };

    rp.filterMovement = function (value, index, array) {

        var result;

        //Filter By Account
        if (rp.selectedAccountForMovementReport != '' && rp.selectedAccountForMovementReport != undefined) {
            if (!(rp.selectedAccountForMovementReport.name == value.origAccount.name || rp.selectedAccountForMovementReport.name == value.destAccount.name)) {
                return false;
            }
        }
        else {
            result = $filter('filter')(rp.accounts, function (d) {
                if ((d.name === value.origAccount.name) && (d.origSelected)) {
                    return true;
                }
            });
            if (result.length == 0) {
                return false;
            }

            result = $filter('filter')(rp.accounts, function (d) {
                if ((d.name === value.destAccount.name) && (d.destSelected)) {
                    return true;
                }
            });
            if (result.length == 0) {
                return false;
            }
        }

        //Filter by Currency
        result = $filter('filter')(rp.currencies, function (d) {
            if ((d.symbol === value.currency.symbol) && (d.selected)) {
                return true;
            }
        });
        if (result.length == 0) {
            return false;
        }

        //Filter by Detail
        result = $filter('filter')(rp.categories, function (category) {
            shouldBeShow = false;
            $.each(category.details, function (index, detail) {
                if ((detail.name === value.detail.name) && (detail.selected)) {
                    shouldBeShow = true;
                }
            });
            return shouldBeShow;
        });
        if (result.length == 0) {
            return false;
        }


        //Filter by Amount
        if (rp.movementFilter.minAmount != '' && rp.movementFilter.minAmount != undefined && !(value.amount >= rp.movementFilter.minAmount))
            return false;

        if (rp.movementFilter.maxAmount != '' && rp.movementFilter.maxAmount != undefined && !(value.amount <= rp.movementFilter.maxAmount))
            return false;

        //Filter by Date
        if (rp.movementFilter.minDate != '' && rp.movementFilter.minDate != undefined && !(new Date(value.movementDate).setHours(0, 0, 0, 0) >= rp.movementFilter.minDate))
            return false;

        if (rp.movementFilter.maxDate != '' && rp.movementFilter.maxDate != undefined && !(new Date(value.movementDate).setHours(0, 0, 0, 0) <= rp.movementFilter.maxDate))
            return false;


        return true;

    };


    rp.modifyAll = function (array, property, state) {
        $.each(array, function (index, element) {
            element[property] = state;
        });
    }

    rp.modifyAllDetails = function (state) {

        $.each(rp.categories, function (index, category) {
            category['selected'] = state;
            rp.changeSelectedDetail(category);
        });

    }

    rp.changeAccountTypeSelection = function (array, propertyToFiter, compareElementToFilter, showingProperty) {
        $.each(array, function (index, element) {
            if (element[propertyToFiter] == compareElementToFilter) {
                element[showingProperty] = rp.accountsType[compareElementToFilter];
            }
        });
        rp.accountsType[compareElementToFilter] = !rp.accountsType[compareElementToFilter];
    }

    rp.changeSelectedDetail = function (category) {
        $.each(category.details, function (index, detail) {
            detail['selected'] = category.selected;
        });
        category.selected = !category.selected;


    }

    rp.eraseSelectedAccount = function () {
        rp.selectedAccountForMovementReport = undefined;
        rp.modifyAll(rp.accounts, 'destSelected', true);
        rp.modifyAll(rp.accounts, 'origSelected', true);
    };

    rp.resetMovementReportFilter = function () {

        rp.selectedAccountForMovementReport = undefined;
        rp.modifyAll(rp.accounts, 'origSelected', true);
        rp.modifyAll(rp.accounts, 'destSelected', true);
        $.each(rp.categories, function (index, category) {
            category['selected'] = true;
            rp.changeSelectedDetail(category);
        });
        rp.movementFilter.minAmount = '';
        rp.movementFilter.maxAmount = '';
        rp.movementFilter.minDate = '';
        rp.movementFilter.maxDate = '';
        $.each(rp.currencies, function (index, currency) {
            currency['selected'] = true;
        });
        if (rp.tableParams != undefined) {
            rp.refreshMovementReport();
        }

    }



///////////////////////////////////////////////////////////////////////////////
/////////////////           Outside Movement Report         ///////////////////
///////////////////////////////////////////////////////////////////////////////


    rp.checkOutSideMovementFilter = function () {
        if (rp.outSidefilter.MovementId != undefined && rp.outSidefilter.MovementId != '') {
            var searched = rp.outSidefilter.MovementId;
            var shown = rp.tableParams.count();
            for (i = 0; i <= rp.movement.length - 1; i++)
                if (rp.movement[i].id == searched) {
                    rp.movement[i].selected = true;
                    page = Math.floor(i / shown);
                    rp.tableParams.page(page + 1)
                }
        }
        rp.movementFilter.maxDate = rp.outSidefilter.MaxDate;
        rp.movementFilter.minDate = rp.outSidefilter.MinDate;
        rp.selectedAccountForMovementReport = rp.outSidefilter.Account;
        rp.outSidefilter.Account = undefined;
        rp.outSidefilter.MovementId = undefined;
        rp.outSidefilter.MaxDate = undefined;
        rp.outSidefilter.MinDate = undefined;
    }


    rp.outSidefilter = {
        Account: undefined,
        MovementId: undefined,
        MinDate: undefined,
        MaxDate: undefined
    }




























    rp.test = function () {
        alert(rp.tableParams);


    }

    rp.test1 = true;
    rp.test2 = function () {
        /*var index2 = 0;
        $.each(rp.movement, function (index, movement) {
            movement.selected = test;
            index2 = index2 + 1;
            if(index2 == 3){
                test = !test;
                index2 = 0;
            }
        });
*/

        //modalManager.toggleModalWindow();
        //rp.test1 = !rp.test1;
        /*var searched = '22';
         var shown = 10;
         for (i = 0; i <= rp.movement.length - 1; i++)
         if (rp.movement[i].id == searched) {
         page = Math.floor(i / 5);
         rp.tableParams.page(page + 1)
         }
         alert('2');*/
    }


})
;