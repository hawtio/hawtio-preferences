/// <reference types="forms" />
/// <reference types="angular" />
/// <reference types="help" />
declare module HawtioPreferences {
    function PreferencesLoggingController($scope: any, SchemaRegistry: HawtioForms.SchemaRegistry): void;
}
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
    const log: Logging.Logger;
}
