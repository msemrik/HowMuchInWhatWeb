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
            /*var jsError = {"title": "Error Retrieving data", "type": "error", "message": "Error Message"};
              alertsManager.showBootStrapModal(jsError); */
            if ($rootScope.modalInstance != undefined) {
                $rootScope.message = $rootScope.message + "\n" + jsObject.message;
            }
            else {
                switch (jsObject.type) {
                    case 'error':
                        $rootScope.headerclass = 'modal-header-error';
                        $rootScope.bodyclass = 'modal-body-error';
                        $rootScope.footerclass = 'modal-footer-error';
                        break;
                    case 'success':
                        $rootScope.headerclass = 'modal-header-success';
                        $rootScope.bodyclass = 'modal-body-success';
                        $rootScope.footerclass = 'modal-footer-success';
                        break;
                }

                $rootScope.title = jsObject.title;
                $rootScope.message = jsObject.message;
                $rootScope.modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'pages/templates/myModalContent.html',
                    scope: $rootScope
                });

                $rootScope.ok = function () {
                    $rootScope.modalInstance.dismiss('cancel');
                    $rootScope.modalInstance = undefined;
                };
            }
        }
    }
        ;
})
;