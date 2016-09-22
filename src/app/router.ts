export default function router($urlRouterProvider: angular.ui.IUrlRouterProvider,
                            $stateProvider: angular.ui.IStateProvider) {
    $urlRouterProvider.otherwise("/example");
    $stateProvider.state("example", {
        controller: "ExampleCtrl",
        controllerAs: "vm",
        templateUrl: "./src/app/example/example.html",
        url: "/example",
    });
}
