/// <reference types="angular" />
/// <reference types="help" />
declare namespace HawtioPreferences {
    class PreferencesService {
        private $window;
        constructor($window: ng.IWindowService);
        saveLocation($location: ng.ILocationService): void;
        restoreLocation($location: ng.ILocationService): void;
        /**
         * Parsers the given value as JSON if it is define
         */
        parsePreferencesJson(value: any, key: any): any;
        initPreferenceScope($scope: any, localStorage: any, defaults: any): void;
        /**
         * Returns true if there is no validFn defined or if its defined
         * then the function returns true.
         *
         * @method isValidFunction
         * @for Perspective
         * @param {Core.Workspace} workspace
         * @param {Function} validFn
         * @param {string} perspectiveId
         * @return {Boolean}
         */
        isValidFunction(workspace: any, validFn: any, perspectiveId: string): boolean;
    }
}
declare namespace HawtioPreferences {
    function PreferencesMenuItemController($scope: any, $location: ng.ILocationService, preferencesService: PreferencesService): void;
}
declare namespace HawtioPreferences {
    class PreferencesRegistry {
        private $rootScope;
        private tabs;
        constructor($rootScope: ng.IRootScopeService);
        addTab(name: string, template: string, isValid?: () => boolean): void;
        getTab(name: string): any;
        getTabs(): {};
    }
}
declare namespace HawtioPreferences {
    function PreferencesResetController($scope: any, $window: ng.IWindowService): void;
}
declare namespace HawtioPreferences {
    function preferencesConfig($provide: any, $routeProvider: any): void;
}
declare namespace HawtioPreferences {
    function PreferencesController($scope: any, $location: ng.ILocationService, preferencesRegistry: PreferencesRegistry, preferencesService: PreferencesService): void;
}
declare namespace HawtioPreferences {
    function preferencesInit($templateCache: ng.ITemplateCacheService, HawtioExtension: any, $compile: ng.ICompileService, preferencesRegistry: PreferencesRegistry, helpRegistry: Help.HelpRegistry): void;
}
declare namespace HawtioPreferences {
    class LoggingPreferencesService {
        private $window;
        private static DEFAULT_LOG_BUFFER_SIZE;
        private static DEFAULT_GLOBAL_LOG_LEVEL;
        constructor($window: ng.IWindowService);
        getLogBuffer(): number;
        setLogBuffer(logBuffer: number): void;
        getGlobalLogLevel(): Logging.LogLevel;
        setGlobalLogLevel(logLevel: Logging.LogLevel): void;
        getChildLoggers(): Logging.ChildLogger[];
        getAvailableChildLoggers(): Logging.ChildLogger[];
        addChildLogger(childLogger: Logging.ChildLogger): void;
        removeChildLogger(childLogger: Logging.ChildLogger): void;
        setChildLoggers(childLoggers: Logging.ChildLogger[]): void;
        reconfigureLoggers(): void;
    }
}
declare namespace HawtioPreferences {
    function LoggingPreferencesController($scope: any, loggingPreferencesService: LoggingPreferencesService): void;
}
declare namespace HawtioPreferences {
    const loggingPreferencesModule: string;
}
declare namespace HawtioPreferences {
    const log: Logging.Logger;
    const templatesLocation = "plugins/preferences/html/";
}
