import "../../typings/index.d.ts";
import exampleModule from "./example/index";

angular.module("app", ["ui.router", "ngResource", exampleModule])
.config(function($urlRouterProvider: angular.ui.IUrlRouterProvider, $stateProvider: angular.ui.IStateProvider) {
    $urlRouterProvider.otherwise("/example");
    $stateProvider.state("example", {
        controller: "ExampleCtrl",
        controllerAs: "vm",
        templateUrl: "./src/app/example/example.html",
        url: "/example",
    });
})
.controller("MainCtrl", function($scope: any) {
    $scope.name = "typescript";
});
