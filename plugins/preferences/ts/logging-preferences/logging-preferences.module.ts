/// <reference path="logging-preferences.controller.ts"/>
/// <reference path="logging-preferences.service.ts"/>

namespace HawtioPreferences {

  const pluginName = 'hawtio-logging-preferences';
  
  export const loggingPreferencesModule = angular
    .module(pluginName, [])
    .controller('HawtioPreferences.PreferencesLoggingController', LoggingPreferencesController)
    .service('loggingPreferencesService', LoggingPreferencesService)
    .name;

}
