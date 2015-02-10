/// <reference path="preferencesPlugin.ts"/>
module HawtioPreferences {
  _module.service('PreferencesLastPath', () => { 
    return {
      lastPath: undefined,
      lastTab: undefined
    };
  });
  _module.controller('HawtioPreferences.MenuItemController', ['$scope', '$location', 'PreferencesLastPath', ($scope, $location:ng.ILocationService, last) => {
    $scope.gotoPreferences = () => {
      last.lastPath = $location.path();
      last.lastSearch = $location.search();
      $location.path('/preferences').search({});
      Core.$apply($scope);
    }
  }]);
  _module.controller("HawtioPreferences.PreferencesController", ["$scope", "$location", "preferencesRegistry", "PreferencesLastPath", ($scope, $location, preferencesRegistry, last) => {
    var panels = preferencesRegistry.getTabs();
    $scope.names = _.keys(panels);
    $scope.$watch(() => {
      panels = preferencesRegistry.getTabs();
      $scope.names = _.keys(panels);
      Core.$apply($scope);
    });
    Core.bindModelToSearchParam($scope, $location, "pref", "pref", 'Reset');
    $scope.setPanel = (name) => {
      $scope.pref = name;
    }
    $scope.active = (name) => {
      if (name === $scope.pref) {
        return 'active';
      }
      return '';
    }
    $scope.done = () => {
      $location.path(last.lastPath).search(last.lastSearch);
      Core.$apply($scope);
    }
    $scope.getPrefs = (pref) => {
      var panel = panels[pref];
      if (panel) {
        return panel.template;
      }
      return undefined;
    }
  }]);
}
