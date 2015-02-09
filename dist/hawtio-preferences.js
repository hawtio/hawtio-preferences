/// <reference path="../libs/hawtio-utilities/defs.d.ts"/>

/// <reference path="../../includes.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences.pluginName = 'hawtio-preferences';
    HawtioPreferences.templatePath = 'plugins/preferences/html';
    HawtioPreferences.log = Logger.get(HawtioPreferences.pluginName);
    /**
    * Parsers the given value as JSON if it is define
    */
    function parsePreferencesJson(value, key) {
        var answer = null;
        if (angular.isDefined(value)) {
            answer = Core.parseJsonText(value, "localStorage for " + key);
        }
        return answer;
    }
    HawtioPreferences.parsePreferencesJson = parsePreferencesJson;
    function initPreferenceScope($scope, localStorage, defaults) {
        angular.forEach(defaults, function (_default, key) {
            $scope[key] = _default['value'];
            var converter = _default['converter'];
            var formatter = _default['formatter'];
            if (!formatter) {
                formatter = function (value) {
                    return value;
                };
            }
            if (!converter) {
                converter = function (value) {
                    return value;
                };
            }
            if (key in localStorage) {
                var value = converter(localStorage[key]);
                HawtioPreferences.log.debug("from local storage, setting ", key, " to ", value);
                $scope[key] = value;
            }
            else {
                var value = _default['value'];
                HawtioPreferences.log.debug("from default, setting ", key, " to ", value);
                localStorage[key] = value;
            }
            var watchFunc = _default['override'];
            if (!watchFunc) {
                watchFunc = function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        if (angular.isFunction(_default['pre'])) {
                            _default.pre(newValue);
                        }
                        var value = formatter(newValue);
                        HawtioPreferences.log.debug("to local storage, setting ", key, " to ", value);
                        localStorage[key] = value;
                        if (angular.isFunction(_default['post'])) {
                            _default.post(newValue);
                        }
                    }
                };
            }
            if (_default['compareAsObject']) {
                $scope.$watch(key, watchFunc, true);
            }
            else {
                $scope.$watch(key, watchFunc);
            }
        });
    }
    HawtioPreferences.initPreferenceScope = initPreferenceScope;
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
    function isValidFunction(workspace, validFn, perspectiveId) {
        return !validFn || validFn(workspace, perspectiveId);
    }
    HawtioPreferences.isValidFunction = isValidFunction;
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="../../includes.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    var PreferencesRegistry = (function () {
        function PreferencesRegistry() {
            this.tabs = {};
        }
        PreferencesRegistry.prototype.addTab = function (name, template, isValid) {
            if (isValid === void 0) { isValid = undefined; }
            if (!isValid) {
                isValid = function () {
                    return true;
                };
            }
            this.tabs[name] = {
                template: template,
                isValid: isValid
            };
        };
        PreferencesRegistry.prototype.getTab = function (name) {
            return this.tabs[name];
        };
        PreferencesRegistry.prototype.getTabs = function () {
            var answer = {};
            angular.forEach(this.tabs, function (value, key) {
                if (value.isValid()) {
                    answer[key] = value;
                }
            });
            return answer;
        };
        return PreferencesRegistry;
    })();
    HawtioPreferences.PreferencesRegistry = PreferencesRegistry;
    ;
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferenceHelpers.ts"/>
/// <reference path="preferencesRegistry.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module = angular.module(HawtioPreferences.pluginName, []);
    // preference registry service that plugins can register preference pages to
    HawtioPreferences._module.config(['$provide', function ($provide) {
        $provide.decorator('preferencesRegistry', ['$delegate', function ($delegate) {
            return new HawtioPreferences.PreferencesRegistry();
        }]);
    }]);
    HawtioPreferences._module.run(['$templateCache', 'HawtioExtension', '$compile', 'preferencesRegistry', function ($templateCache, ext, $compile, preferencesRegistry) {
        ext.add('hawtio-user', function ($scope) {
            var template = $templateCache.get(UrlHelpers.join(HawtioPreferences.templatePath, 'menuItem.html'));
            return $compile(template)($scope);
        });
        ext.add('hawtio-global', function ($scope) {
            var template = $templateCache.get(UrlHelpers.join(HawtioPreferences.templatePath, 'bodyExt.html'));
            return $compile(template)($scope);
        });
        HawtioPreferences.log.debug("loaded");
        preferencesRegistry.addTab("Reset", "plugins/preferences/html/resetPreferences.html");
    }]);
    hawtioPluginLoader.addModule(HawtioPreferences.pluginName);
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferencesPlugin.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module.controller('HawtioPreferences.MenuItemController', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.showPreferences = function () {
            $rootScope.$broadcast('HawtioPreferencesToggle');
        };
    }]);
    HawtioPreferences._module.controller('HawtioPreferences.SlideoutController', ['$scope', function ($scope) {
        $scope.showPrefs = false;
        $scope.$on('HawtioPreferencesToggle', function () {
            $scope.showPrefs = !$scope.showPrefs;
        });
    }]);
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferencesPlugin.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module.controller("HawtioPreferences.PreferencesController", ["$scope", "$location", "preferencesRegistry", "$element", function ($scope, $location, preferencesRegistry, $element) {
        Core.bindModelToSearchParam($scope, $location, "pref", "pref", "Core");
        $scope.panels = {};
        $scope.$watch(function () {
            return $element.is(':visible');
        }, function (newValue, oldValue) {
            if (newValue) {
                setTimeout(function () {
                    $scope.panels = preferencesRegistry.getTabs();
                    HawtioPreferences.log.debug("Panels: ", $scope.panels);
                    Core.$apply($scope);
                }, 50);
            }
        });
    }]);
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferencesPlugin.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module.controller("Core.ResetPreferences", ["$scope", "localStorage", function ($scope, localStorage) {
        $scope.doReset = function () {
            HawtioPreferences.log.info("Resetting");
            var doReset = function () {
                localStorage.clear();
                setTimeout(function () {
                    window.location.reload();
                }, 10);
            };
            doReset();
        };
    }]);
})(HawtioPreferences || (HawtioPreferences = {}));

angular.module("hawtio-preferences-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/preferences/html/bodyExt.html","<div ng-controller=\"HawtioPreferences.SlideoutController\">\n  <div class=\"pref-slideout\" hawtio-slideout=\"showPrefs\" title=\"{{branding.appName}} Preferences\">\n    <div class=\"dialog-body\">\n      <div ng-controller=\"HawtioPreferences.PreferencesController\" title=\"\"\n        class=\"prefs\">\n        <div class=\"row-fluid\">\n          <div class=\"tabbable\" ng-model=\"pref\">\n            <div ng-repeat=\"(name, panel) in panels\" \n              value=\"{{name}}\" \n              class=\"tab-pane\" \n              title=\"{{name}}\"\n              ng-include=\"panel.template\"></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/preferences/html/menuItem.html","<li ng-controller=\"HawtioPreferences.MenuItemController\">\n  <a href=\"\" ng-click=\"showPreferences()\">Preferences</a>\n</li>\n");
$templateCache.put("plugins/preferences/html/resetPreferences.html","<div ng-controller=\"HawtioPreferences.ResetPreferences\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\">\n          <strong>\n            <i class=\'yellow text-shadowed icon-warning-sign\'></i> Reset settings\n          </strong>\n        </label>\n        <div class=\"controls\">\n          <button class=\"btn btn-danger\" ng-click=\"doReset()\">Reset to defaults</button>\n          <span class=\"help-block\">Wipe settings stored by {{branding.appName}} in your browser\'s local storage</span>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-preferences-templates");