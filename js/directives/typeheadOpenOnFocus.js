app.directive('focusMe', function($timeout, $parse) {
    return {
        //scope: true,   // optionally create a child scope
        link: function(scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                if(value === true) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
        }
    };
});
app.directive('emptyTypeahead', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                // this parser run before typeahead's parser
                modelCtrl.$parsers.unshift(function (inputValue) {
                    var value = (inputValue ? inputValue : secretEmptyKey); // replace empty string with secretEmptyKey to bypass typeahead-min-length check
                    modelCtrl.$viewValue = value; // this $viewValue must match the inputValue pass to typehead directive
                    return value;
                });

                // this parser run after typeahead's parser
                modelCtrl.$parsers.push(function (inputValue) {
                    return inputValue === secretEmptyKey ? '' : inputValue; // set the secretEmptyKey back to empty string
                });
            }
        }
    })
    .controller('TypeaheadCtrl', function($scope, $http, $timeout) {

    });
