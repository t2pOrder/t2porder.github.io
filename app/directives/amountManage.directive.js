
(function (module) {
    "use strict";
    module.directive("amountManage", amountManageDirective);
    function amountManageDirective() {
        var directive = {
            restrict: "E",
            scope: {
                accounts: "="
            },
            link: link,
            templateUrl: "app/directives/amountManage.directive.html"
        };

        return directive;

        function link(scope, element, attr) {

            scope.SumBalance = (account) => _.sumBy(account, 'balance');

            scope.SumDebitAmount = (account) => {
                return _.sumBy(account, function (o) {
                    if (o.balance <= 0)
                        return o.balance;
                    return 0;
                });
            }
        }
    }
}
)(angular.module("myApp"));