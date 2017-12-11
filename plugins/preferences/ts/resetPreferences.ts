/// <reference path="preferencesPlugin.ts"/>
namespace HawtioPreferences {
  _module.controller("HawtioPreferences.ResetPreferences", ["$scope", "localStorage", ($scope, localStorage) => {
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
