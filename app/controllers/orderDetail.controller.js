(function (module) {
    module.controller("OrderDetailController", orderDetailController);
    orderDetailController.$inject = ["$sce", "$timeout", "$state", "$stateParams", "orderService", "authenService"];
    function orderDetailController($sce, $timeout, $state, $stateParams, orderService, authenService) {
        var model = this;
        var orderKey = $stateParams.key;
        var { displayName } = firebase.auth().currentUser || "";
        model.orderDetail = {
            name: displayName
        }

        model.submitOrderDetail = submitOrderDetail;
        model.removeOrderDetail = removeOrderDetail;
        model.editOrderDetail = editOrderDetail;
        model.payCheckOrderDetail = payCheckOrderDetail;

        var currentUser = authenService.getCurrentUser();

        activate();

        function activate() {
            orderService.subscribeOrder(orderKey, function (data) {
                if (!data) return;
                if (data.withdrawFromAccountBalance && !currentUser) {
                    $state.go("main.login", { returnState: $state.current.name, returnParams: JSON.stringify({ key: $stateParams.key }) });
                }
                else {
                    $timeout(function () {
                        if(currentUser){
                             model.isBooker = currentUser.uid === data.user.key;
                        }
                        model.selectedOrder = data;
                        model.trustedWebsiteUrl = $sce.trustAsResourceUrl(model.selectedOrder.menuUrl);
                    });
                }
            });
        }

        function submitOrderDetail() {
            if (!model.orderDetail.name || !model.orderDetail.desc) return;
            model.orderDetail.tranId = model.orderDetail.tranId || window.generateId();

            var updateOrder = angular.copy(model.selectedOrder);

            if (model.editOrderDetailIndex !== undefined) {
                updateOrder.detail[model.editOrderDetailIndex] = model.orderDetail;
            }
            else {
                if (!updateOrder.detail) updateOrder.detail = [];

                if (currentUser)
                    model.orderDetail.transactionStatus = true;
                else
                    model.orderDetail.transactionStatus = false;

                updateOrder.detail.push(model.orderDetail);
            }

            if (currentUser) {
                var { displayName, email, uid } = currentUser;
                model.orderDetail.createdUser = model.orderDetail.createdUser || { displayName, email, uid };
            }

            orderService.updateOrder(updateOrder)
                .then(function () {
                    model.orderDetail = undefined;
                    model.editOrderDetailIndex = undefined;
                });
        }

        function removeOrderDetail(index) {
            var removedOrderDetail = model.selectedOrder.detail.splice(index, 1)[0];

            if (!model.selectedOrder.removedDetail)
                model.selectedOrder.removedDetail = [removedOrderDetail];
            else model.selectedOrder.removedDetail.push(removedOrderDetail);

            var updateOrder = angular.copy(model.selectedOrder);
            orderService.updateOrder(updateOrder);
        }

        function editOrderDetail(index, orderDetail) {
            model.orderDetail = angular.copy(orderDetail);
            model.editOrderDetailIndex = index;
        }   

        function payCheckOrderDetail(index, orderDetail) {
            if (orderDetail.isPaid) {
                orderDetail.isPaid = false;
            } else {
                orderDetail.isPaid = true;
            }

            var updateOrder = angular.copy(model.selectedOrder);
            updateOrder.detail[index] = orderDetail;

            orderService.updateOrder(updateOrder);
        }
    }

})(angular.module("myApp"));
