/// <reference path="preferences.service.ts"/>

namespace HawtioPreferences {

  export function PreferencesController($scope,
                                        $location: ng.ILocationService,
                                        preferencesRegistry: PreferencesRegistry,
                                        preferencesService: PreferencesService) {
    'ngInject';      

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

    $scope.close = () => {
      preferencesService.restoreLocation($location);
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

  }

}
