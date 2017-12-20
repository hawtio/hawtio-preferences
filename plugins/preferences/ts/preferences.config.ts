/// <reference path="preferences-registry.ts"/>

namespace HawtioPreferences {

  export function preferencesConfig($provide, $routeProvider) {
    'ngInject';
    
    $routeProvider.when('/preferences', { templateUrl: templatesLocation + 'preferences.html', reloadOnSearch: false });
    
    $provide.decorator('preferencesRegistry', ['$delegate', '$rootScope', ($delegate, $rootScope) => {
      return new PreferencesRegistry($rootScope);
    }]);
  }

}
