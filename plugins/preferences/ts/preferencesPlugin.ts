/// <reference path="preferenceHelpers.ts"/>
/// <reference path="preferencesRegistry.ts"/>
namespace HawtioPreferences {
  export var _module = angular.module(pluginName, []);

  // preference registry service that plugins can register preference pages to
  _module.config(['$provide', '$routeProvider', ($provide, $routeProvider) => {
    $routeProvider.when('/preferences', { templateUrl: UrlHelpers.join(templatePath, 'preferences.html'), reloadOnSearch: false });
    $provide.decorator('preferencesRegistry', ['$delegate', '$rootScope', ($delegate, $rootScope:ng.IRootScopeService) => {
      return new HawtioPreferences.PreferencesRegistry($rootScope);
    }]);
  }]);

  _module.run(['$templateCache', 'HawtioExtension', '$compile', 'preferencesRegistry', 'helpRegistry', ($templateCache:ng.ITemplateCacheService, ext, $compile:ng.ICompileService, preferencesRegistry:PreferencesRegistry, helpRegistry) => {
    ext.add('hawtio-user', ($scope) => {
      var template = $templateCache.get<string>(UrlHelpers.join(templatePath, 'menuItem.html'));
      return $compile(template)($scope);
    });
    log.debug("loaded");
    helpRegistry.addUserDoc('preferences', 'plugins/preferences/doc/help.md');
    preferencesRegistry.addTab("Console Logging", UrlHelpers.join(templatePath, "loggingPreferences.html"));
    preferencesRegistry.addTab("Reset", UrlHelpers.join(templatePath, "resetPreferences.html"));
  }]);
  hawtioPluginLoader.addModule(pluginName);
}
