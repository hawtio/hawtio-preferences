/// <reference path="preferences.config.ts"/>
/// <reference path="preferences.init.ts"/>
/// <reference path="preferences.service.ts"/>
/// <reference path="preferences.controller.ts"/>
/// <reference path="preferences-menu-item.controller.ts"/>
/// <reference path="preferences-reset.controller.ts"/>
/// <reference path="logging-preferences/logging-preferences.module.ts"/>

namespace HawtioPreferences {

  const pluginName = 'hawtio-preferences';
  export const log = Logger.get(pluginName);
  export const templatesLocation = 'plugins/preferences/html/';
  
  angular
    .module(pluginName, [
      loggingPreferencesModule
    ])
    .config(preferencesConfig)
    .run(preferencesInit)
    .controller('HawtioPreferences.PreferencesController', PreferencesController)
    .controller('HawtioPreferences.PreferencesMenuItemController', PreferencesMenuItemController)
    .controller('HawtioPreferences.PreferencesResetController', PreferencesResetController)
    .service('preferencesService', PreferencesService);

  hawtioPluginLoader.addModule(pluginName);

}
