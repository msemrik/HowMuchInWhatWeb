app.controller("AlertsCtrl", function ($scope, alertsManager, modalManager, $rootScope) {

    var alert = this;

    alert.toggleModalWindow = function(){
        modalManager.toggleModalWindow();
    }
    alert.clearAlerts = function () {
        alertsManager.clearAlerts();
    }

    alert.undo = function (id) {
        $rootScope.$emit('undoMovement', id);
    }

    alert.openMovementReport = function (id) {
        $rootScope.$emit('loadReportFromOutside', id,'movement');
    }

    alert.alerts = alertsManager.alerts;
    alert.toggleModalWindow();
    alert.modalManager = modalManager.modalManager;

});