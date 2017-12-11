/// <reference path="preferencesPlugin.ts"/>
namespace HawtioPreferences {

  _module.service('PreferencesLastPath', () => {
    return {
      lastPath: undefined,
      lastTab: undefined
    };
  });

  _module.service('HawtioPreferences', ['PreferencesLastPath', '$location', '$rootScope', (last, $location:ng.ILocationService, $rootScope:ng.IRootScopeService) => {
    var self = {
      goto: (pref = undefined) => {
        var search = {};
        if (pref) {
          search['pref'] = pref;
        }
        last.lastPath = $location.path();
        last.lastSearch = $location.search();
        $location.path('/preferences').search(search);
        Core.$apply($rootScope);
      }
    };
    return self;
  }]);

  _module.controller('HawtioPreferences.MenuItemController', ['$scope', '$location', 'PreferencesLastPath', ($scope, $location:ng.ILocationService, last) => {
    $scope.gotoPreferences = () => {
      last.lastPath = $location.path();
      last.lastSearch = $location.search();
      $location.path('/preferences').search({});
      Core.$apply($scope);
    }
  }]);

  _module.controller("HawtioPreferences.PreferencesController", ["$scope", "$location", "preferencesRegistry", "PreferencesLastPath", ($scope, $location:ng.ILocationService, preferencesRegistry:PreferencesRegistry, last) => {
    var panels = preferencesRegistry.getTabs();
    $scope.names = sortNames(_.keys(panels));

    $scope.$watch(() => {
      panels = preferencesRegistry.getTabs();
      $scope.names = sortNames(_.keys(panels));
      Core.$apply($scope);
    });

    // pick the first one as the default
    Core.bindModelToSearchParam($scope, $location, "pref", "pref", $scope.names[0]);

    $scope.setPanel = (name) => {
      $scope.pref = name;
    };

    $scope.active = (name) => {
      if (name === $scope.pref) {
        return 'active';
      }
      return '';
    };

    $scope.done = () => {
      $location.path(last.lastPath).search(last.lastSearch);
      Core.$apply($scope);
    };

    $scope.getPrefs = (pref) => {
      var panel = panels[pref];
      if (panel) {
        return panel.template;
      }
      return undefined;
    };

    /**
     * Sort the preference by names (and ensure Reset is last).
     * @param names  the names
     * @returns {any} the sorted names
     */
    function sortNames(names) {
      return names.sort((a,b) => {
        if ("Reset" == a) {
          return 1;
        } else if ("Reset" == b) {
          return -1;
        }
        return a.localeCompare(b);
      })
    }

  }]);
}
