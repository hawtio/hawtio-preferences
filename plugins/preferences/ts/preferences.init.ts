namespace HawtioPreferences {

  export function preferencesInit($templateCache: ng.ITemplateCacheService,
                                  HawtioExtension,
                                  $compile: ng.ICompileService,
                                  preferencesRegistry: PreferencesRegistry,
                                  helpRegistry: Help.HelpRegistry) {
    'ngInject';
    
    HawtioExtension.add('hawtio-user', ($scope) => {
      var template = $templateCache.get<string>(templatesLocation + 'preferences-menu-item.html');
      return $compile(template)($scope);
    });
    
    log.debug("loaded");
    
    helpRegistry.addUserDoc('preferences', 'plugins/preferences/doc/help.md');
    
    preferencesRegistry.addTab("Console Logging", templatesLocation + 'logging-preferences.html');
    preferencesRegistry.addTab("Reset", templatesLocation + 'preferences-reset.html');
  }

}
