/// <reference path="preferencesPlugin.ts"/>
module HawtioPreferences {
  _module.controller('HawtioPreferences.MenuItemController', ['$scope', '$rootScope', ($scope, $rootScope) => {
    $scope.showPreferences = () => {
      $rootScope.$broadcast('HawtioPreferencesToggle');
    }
  }]);
  _module.controller('HawtioPreferences.SlideoutController', ['$scope', ($scope) => {
    $scope.showPrefs = false;
    $scope.$on('HawtioPreferencesToggle', () => {
      $scope.showPrefs = !$scope.showPrefs;
    });
  }]);
}
