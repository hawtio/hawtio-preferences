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
                formatter = function (value) { return value; };
            }
            if (!converter) {
                converter = function (value) { return value; };
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
        function PreferencesRegistry($rootScope) {
            this.$rootScope = $rootScope;
            this.tabs = {};
        }
        PreferencesRegistry.prototype.addTab = function (name, template, isValid) {
            if (isValid === void 0) { isValid = undefined; }
            if (!isValid) {
                isValid = function () { return true; };
            }
            this.tabs[name] = {
                template: template,
                isValid: isValid
            };
            this.$rootScope.$broadcast('HawtioPreferencesTabAdded');
            Core.$apply(this.$rootScope);
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
    }());
    HawtioPreferences.PreferencesRegistry = PreferencesRegistry;
    ;
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferenceHelpers.ts"/>
/// <reference path="preferencesRegistry.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module = angular.module(HawtioPreferences.pluginName, []);
    // preference registry service that plugins can register preference pages to
    HawtioPreferences._module.config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
            $routeProvider.when('/preferences', { templateUrl: UrlHelpers.join(HawtioPreferences.templatePath, 'preferences.html'), reloadOnSearch: false });
            $provide.decorator('preferencesRegistry', ['$delegate', '$rootScope', function ($delegate, $rootScope) {
                    return new HawtioPreferences.PreferencesRegistry($rootScope);
                }]);
        }]);
    HawtioPreferences._module.run(['$templateCache', 'HawtioExtension', '$compile', 'preferencesRegistry', function ($templateCache, ext, $compile, preferencesRegistry) {
            ext.add('hawtio-user', function ($scope) {
                var template = $templateCache.get(UrlHelpers.join(HawtioPreferences.templatePath, 'menuItem.html'));
                return $compile(template)($scope);
            });
            HawtioPreferences.log.debug("loaded");
            preferencesRegistry.addTab("Console Logging", UrlHelpers.join(HawtioPreferences.templatePath, "loggingPreferences.html"));
            preferencesRegistry.addTab("Reset", UrlHelpers.join(HawtioPreferences.templatePath, "resetPreferences.html"));
        }]);
    hawtioPluginLoader.addModule(HawtioPreferences.pluginName);
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferencesPlugin.ts"/>
/// <reference path="preferenceHelpers.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module.controller("HawtioPreferences.LoggingPreferences", ["$scope", "SchemaRegistry", function ($scope, schemas) {
            function getLoggers() {
                var allLoggers = Logger['loggers'];
                var allLoggersEnum = _.keys(allLoggers);
                var theEnum = {};
                _.forIn(allLoggers, function (value, key) {
                    theEnum[key] = key;
                });
                return theEnum;
            }
            var levelEnum = {
                Off: 'OFF',
                Error: 'ERROR',
                Warn: 'WARN',
                Info: 'INFO',
                Debug: 'DEBUG'
            };
            schemas.addSchema('ChildLoggers', {
                properties: {
                    logger: {
                        type: "string",
                        enum: getLoggers()
                    },
                    level: {
                        type: 'string',
                        enum: levelEnum,
                        description: 'Level of logging for the child logger'
                    }
                }
            });
            var config = {
                properties: {
                    logBuffer: {
                        type: 'number',
                        default: 100,
                        description: 'The number of log statements to keep available in the logging console'
                    },
                    globalLogLevel: {
                        type: 'string',
                        enum: levelEnum,
                        description: 'Level of logging for the logging console'
                    },
                    childLoggers: {
                        type: 'array',
                        items: {
                            type: 'ChildLoggers'
                        }
                    }
                }
            };
            function setChildLoggers() {
                if (!$scope.childLoggers) {
                    return;
                }
                _.forEach($scope.childLoggers, function (child) {
                    Logger.get(child.logger).setLevel(Logger[child.level]);
                });
            }
            $scope.$watch('globalLogLevel', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    localStorage['logLevel'] = angular.toJson(Logger[newValue]);
                    Logger.setLevel(Logger[newValue]);
                    // the above overwrites child loggers according to the doc
                    setChildLoggers();
                }
                else {
                    try {
                        $scope.globalLogLevel = angular.fromJson(localStorage['logLevel']).name;
                    }
                    catch (e) {
                        $scope.globalLogLevel = 'INFO';
                    }
                    setChildLoggers();
                }
            });
            $scope.$watchCollection('childLoggers', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    localStorage['childLoggers'] = angular.toJson(newValue);
                    setChildLoggers();
                }
                else {
                    try {
                        $scope.childLoggers = angular.fromJson(localStorage['childLoggers']);
                    }
                    catch (e) {
                        $scope.childLoggers = [];
                    }
                }
            });
            $scope.entity = $scope;
            $scope.config = config;
            Core.initPreferenceScope($scope, localStorage, {
                'logBuffer': {
                    'value': 100,
                    'converter': parseInt,
                    'formatter': parseInt,
                    'post': function (newValue) {
                        window['LogBuffer'] = newValue;
                    }
                }
            });
        }]);
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferencesPlugin.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module.service('PreferencesLastPath', function () {
        return {
            lastPath: undefined,
            lastTab: undefined
        };
    });
    HawtioPreferences._module.service('HawtioPreferences', ['PreferencesLastPath', '$location', '$rootScope', function (last, $location, $rootScope) {
            var self = {
                goto: function (pref) {
                    if (pref === void 0) { pref = undefined; }
                    var search = {};
                    if (pref) {
                        search['pref'] = pref;
                    }
                    last.lastPath = $location.path();
                    last.lastSearch = $location.search();
                    $location.path('/preferences').search(search);
                    Core.$apply($rootScope);
                }
            };
            return self;
        }]);
    HawtioPreferences._module.controller('HawtioPreferences.MenuItemController', ['$scope', '$location', 'PreferencesLastPath', function ($scope, $location, last) {
            $scope.gotoPreferences = function () {
                last.lastPath = $location.path();
                last.lastSearch = $location.search();
                $location.path('/preferences').search({});
                Core.$apply($scope);
            };
        }]);
    HawtioPreferences._module.controller("HawtioPreferences.PreferencesController", ["$scope", "$location", "preferencesRegistry", "PreferencesLastPath", function ($scope, $location, preferencesRegistry, last) {
            var panels = preferencesRegistry.getTabs();
            $scope.names = sortNames(_.keys(panels));
            $scope.$watch(function () {
                panels = preferencesRegistry.getTabs();
                $scope.names = sortNames(_.keys(panels));
                Core.$apply($scope);
            });
            // pick the first one as the default
            Core.bindModelToSearchParam($scope, $location, "pref", "pref", $scope.names[0]);
            $scope.setPanel = function (name) {
                $scope.pref = name;
            };
            $scope.active = function (name) {
                if (name === $scope.pref) {
                    return 'active';
                }
                return '';
            };
            $scope.done = function () {
                $location.path(last.lastPath).search(last.lastSearch);
                Core.$apply($scope);
            };
            $scope.getPrefs = function (pref) {
                var panel = panels[pref];
                if (panel) {
                    return panel.template;
                }
                return undefined;
            };
            /**
             * Sort the preference by names (and ensure Reset is last).
             * @param names  the names
             * @returns {any} the sorted names
             */
            function sortNames(names) {
                return names.sort(function (a, b) {
                    if ("Reset" == a) {
                        return 1;
                    }
                    else if ("Reset" == b) {
                        return -1;
                    }
                    return a.localeCompare(b);
                });
            }
        }]);
})(HawtioPreferences || (HawtioPreferences = {}));

/// <reference path="preferencesPlugin.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    HawtioPreferences._module.controller("HawtioPreferences.ResetPreferences", ["$scope", "localStorage", function ($scope, localStorage) {
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

angular.module("hawtio-preferences-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/preferences/html/loggingPreferences.html","<div ng-controller=\"HawtioPreferences.LoggingPreferences\">\n  <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n</div>\n");
$templateCache.put("plugins/preferences/html/menuItem.html","<li ng-controller=\"HawtioPreferences.MenuItemController\">\n  <a href=\"\" ng-click=\"gotoPreferences()\">Preferences</a>\n</li>\n");
$templateCache.put("plugins/preferences/html/preferences.html","<div ng-controller=\"HawtioPreferences.PreferencesController\">\n  <div class=\"row\">\n    <div class=\"col-sm-9 col-md-10 col-sm-push-3 col-md-push-2\">\n      <h3>{{pref}}</h3>\n      <div ng-include=\"getPrefs(pref)\"></div>\n    </div>\n    <div class=\"col-sm-3 col-md-2 col-sm-pull-9 col-md-pull-10 sidebar-pf sidebar-pf-left\">\n      <div class=\"nav-category\">\n        <ul class=\"nav nav-pills nav-stacked\">\n          <li ng-repeat=\"name in names\" ng-class=\"active(name)\">\n            <a href=\"#\" ng-click=\"setPanel(name)\">{{name}}</a>\n          </li>\n          <li class=\"align-center\">\n            <p></p>\n            <button class=\"btn btn-default\" ng-click=\"done()\">Done</button>\n            <p></p>\n          </li>\n        </ul>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/preferences/html/resetPreferences.html","<div ng-controller=\"HawtioPreferences.ResetPreferences\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"form-group\">\n        <label class=\"col-sm-2 control-label\">\n          <strong>\n            <span class=\"pficon pficon-warning-triangle-o\"></span> Reset settings\n          </strong>\n        </label>\n        <div class=\"col-sm-10\">\n          <button class=\"btn btn-danger\" ng-click=\"doReset()\">Reset to defaults</button>\n          <span class=\"help-block\">Wipe settings stored by {{branding.appName}} in your browser\'s local storage</span>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-preferences-templates");