namespace HawtioPreferences {

  export function preferencesInit($templateCache: ng.ITemplateCacheService,
                                  HawtioExtension,
                                  $compile: ng.ICompileService,
                                  preferencesRegistry: PreferencesRegistry,
                                  helpRegistry: Help.HelpRegistry) {
    'ngInject';
    
    HawtioExtension.add('hawtio-user', ($scope) => {
      var template = $templateCache.get<string>('plugins/preferences/html/preferences-menu-item.html');
      return $compile(template)($scope);
    });
    
    log.debug("loaded");
    
    helpRegistry.addUserDoc('preferences', 'plugins/preferences/doc/help.md');
    
    preferencesRegistry.addTab("Logging", 'plugins/preferences/html/preferences-logging.html');
    preferencesRegistry.addTab("Reset", 'plugins/preferences/html/preferences-reset.html');
  }

}
