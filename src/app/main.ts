import "../../typings/index.d.ts";
import MainCtrl from "./MainCtrl";
import exampleModule from "./example/index";
import router from "./router";

angular.module("app", ["ui.router", "ngResource", "ccms.components", exampleModule])
.config(router)
.controller("MainCtrl", MainCtrl);
