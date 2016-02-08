app.factory('modalManager', function ($document, $rootScope) {
    return {
        modalManager: {isShowingModal: true},
        toggleModalWindow: function() {
            if(this.modalManager.isShowingModal == true){
                this.modalManager.isShowingModal = false;
            }
            else {
                this.modalManager.isShowingModal = true;
            }
        }
    };
})
;