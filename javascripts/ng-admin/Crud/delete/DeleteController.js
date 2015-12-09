export default class DeleteController {
    constructor($scope, $window, $state, $q, WriteQueries, notification, params, view, entry) {
        this.$scope = $scope;
        this.$window = $window;
        this.$state = $state;
        this.WriteQueries = WriteQueries;
        this.entityLabel = params.entity;
        this.entityId = params.id;
        this.view = view;
        this.title = view.title();
        this.description = view.description();
        this.actions = view.actions();
        this.entity = view.getEntity();
        this.notification = notification;
        this.$scope.entry = entry;
        this.$scope.view = view;

        $scope.$on('$destroy', this.destroy.bind(this));

        this.previousStateParametersDeferred = $q.defer();
        $scope.$on('$stateChangeSuccess', (event, to, toParams, from, fromParams) => {
            this.previousStateParametersDeferred.resolve(fromParams);
        });
    }

    deleteOne() {
        var notification = this.notification,
            entityName = this.entity.name();

        return this.WriteQueries.deleteOne(this.view, this.entityId)
            .then(
                () => {
                    this.previousStateParametersDeferred.promise.then(previousStateParameters => {
                        // if previous page was related to deleted entity, redirect to list
                        if (previousStateParameters.entity === entityName && previousStateParameters.id === this.entityId) {
                            this.$state.go(this.$state.get('list'), angular.extend({
                                entity: entityName
                            }, this.$state.params));
                        } else {
                            this.back();
                        }

                        notification.log('删除成功', { addnCls: 'humane-flatty-success' });
                    });
                },
                response => {
                    // @TODO: share this method when splitting controllers
                    var body = response.data;
                    if (typeof body === 'object') {
                        body = JSON.stringify(body);
                    }

                    notification.log('发生了一个错误 : (错误码: ' + response.status + ') ' + body, {addnCls: 'humane-flatty-error'});
                }
            );
    }

    back() {
        this.$window.history.back();
    }

    destroy () {
        this.$scope = undefined;
        this.WriteQueries = undefined;
        this.view = undefined;
        this.entity = undefined;
    }
}

DeleteController.$inject = ['$scope', '$window', '$state', '$q', 'WriteQueries', 'notification', 'params', 'view', 'entry'];
