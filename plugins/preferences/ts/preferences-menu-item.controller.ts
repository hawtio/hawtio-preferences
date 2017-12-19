/// <reference path="preferences.service.ts"/>

namespace HawtioPreferences {

  export function PreferencesMenuItemController($scope,
                                                $location: ng.ILocationService,
                                                preferencesService: PreferencesService) {
    'ngInject';
    
    $scope.gotoPreferences = function() {
      preferencesService.saveLocation($location);
      $location.path('/preferences').search({});
    }

  }

}
