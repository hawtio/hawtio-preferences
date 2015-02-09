/// <reference path="../../includes.d.ts" />
declare module HawtioPreferences {
    class PreferencesRegistry {
        private tabs;
        constructor();
        addTab(name: string, template: string, isValid?: () => boolean): void;
        getTab(name: string): any;
        getTabs(): any;
    }
}
