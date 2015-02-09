/// <reference path="preferencesPlugin.ts"/>
 module HawtioPreferences {
  _module.controller("Core.ResetPreferences", ["$scope", "localStorage", ($scope, localStorage) => {
    $scope.doReset = () => {
      log.info("Resetting");
      var doReset = () => {
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 10);
      };
      doReset();
    };
  }]);
 }
