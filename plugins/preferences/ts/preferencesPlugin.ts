/// <reference path="preferenceHelpers.ts"/>
/// <reference path="preferencesRegistry.ts"/>
module HawtioPreferences {
  export var _module = angular.module(pluginName, []);

  // preference registry service that plugins can register preference pages to
  _module.config(['$provide', ($provide) => {
    $provide.decorator('preferencesRegistry', ['$delegate', '$rootScope', ($delegate, $rootScope) => {
      return new HawtioPreferences.PreferencesRegistry($rootScope);
    }]);
  }]);

  _module.run(['$templateCache', 'HawtioExtension', '$compile', 'preferencesRegistry', ($templateCache:ng.ITemplateCacheService, ext, $compile:ng.ICompileService, preferencesRegistry) => {
    ext.add('hawtio-user', ($scope) => {
      var template = $templateCache.get(UrlHelpers.join(templatePath, 'menuItem.html'));
      return $compile(template)($scope);
    });
    ext.add('hawtio-global', ($scope) => {
      var template = $templateCache.get(UrlHelpers.join(templatePath, 'bodyExt.html'));
      return $compile(template)($scope);
    });
    log.debug("loaded");
    preferencesRegistry.addTab("Reset", "plugins/preferences/html/resetPreferences.html");
  }]);
  hawtioPluginLoader.addModule(pluginName);
}
