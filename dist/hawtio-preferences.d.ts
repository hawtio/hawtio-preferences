/// <reference types="angular" />
declare module HawtioPreferences {
    var pluginName: string;
    var templatePath: string;
    var log: Logging.Logger;
    /**
    * Parsers the given value as JSON if it is define
    */
    function parsePreferencesJson(value: any, key: any): any;
    function initPreferenceScope($scope: any, localStorage: any, defaults: any): void;
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
    function isValidFunction(workspace: any, validFn: any, perspectiveId: string): boolean;
}
declare module HawtioPreferences {
    class PreferencesRegistry {
        private $rootScope;
        private tabs;
        constructor($rootScope: ng.IRootScopeService);
        addTab(name: string, template: string, isValid?: () => boolean): void;
        getTab(name: string): any;
        getTabs(): any;
    }
}
declare module HawtioPreferences {
    var _module: angular.IModule;
}
declare module HawtioPreferences {
}
declare module HawtioPreferences {
}
declare module HawtioPreferences {
}
