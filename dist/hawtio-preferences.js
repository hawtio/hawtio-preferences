var HawtioPreferences;
(function (HawtioPreferences) {
    PreferencesLoggingController.$inject = ["$scope", "SchemaRegistry"];
    function PreferencesLoggingController($scope, SchemaRegistry) {
        'ngInject';
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
        SchemaRegistry.addSchema('ChildLoggers', {
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
    }
    HawtioPreferences.PreferencesLoggingController = PreferencesLoggingController;
})(HawtioPreferences || (HawtioPreferences = {}));
var HawtioPreferences;
(function (HawtioPreferences) {
    var PreferencesService = /** @class */ (function () {
        PreferencesService.$inject = ["$window"];
        function PreferencesService($window) {
            'ngInject';
            this.$window = $window;
        }
        PreferencesService.prototype.saveLocation = function ($location) {
            this.$window.sessionStorage.setItem('lastPath', $location.path());
            this.$window.sessionStorage.setItem('lastSearch', $location.search());
        };
        PreferencesService.prototype.restoreLocation = function ($location) {
            $location
                .path(this.$window.sessionStorage.getItem('lastPath'))
                .search(this.$window.sessionStorage.getItem('lastSearch'));
        };
        /**
         * Parsers the given value as JSON if it is define
         */
        PreferencesService.prototype.parsePreferencesJson = function (value, key) {
            var answer = null;
            if (angular.isDefined(value)) {
                answer = Core.parseJsonText(value, "localStorage for " + key);
            }
            return answer;
        };
        PreferencesService.prototype.initPreferenceScope = function ($scope, localStorage, defaults) {
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
        };
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
        PreferencesService.prototype.isValidFunction = function (workspace, validFn, perspectiveId) {
            return !validFn || validFn(workspace, perspectiveId);
        };
        return PreferencesService;
    }());
    HawtioPreferences.PreferencesService = PreferencesService;
})(HawtioPreferences || (HawtioPreferences = {}));
/// <reference path="preferences.service.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    PreferencesMenuItemController.$inject = ["$scope", "$location", "preferencesService"];
    function PreferencesMenuItemController($scope, $location, preferencesService) {
        'ngInject';
        $scope.gotoPreferences = function () {
            preferencesService.saveLocation($location);
            $location.path('/preferences').search({});
        };
    }
    HawtioPreferences.PreferencesMenuItemController = PreferencesMenuItemController;
})(HawtioPreferences || (HawtioPreferences = {}));
var HawtioPreferences;
(function (HawtioPreferences) {
    var PreferencesRegistry = /** @class */ (function () {
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
})(HawtioPreferences || (HawtioPreferences = {}));
var HawtioPreferences;
(function (HawtioPreferences) {
    PreferencesResetController.$inject = ["$scope", "$window"];
    var SHOW_ALERT = 'showPreferencesResetAlert';
    function PreferencesResetController($scope, $window) {
        'ngInject';
        $scope.showAlert = !!$window.sessionStorage.getItem(SHOW_ALERT);
        $window.sessionStorage.removeItem(SHOW_ALERT);
        $scope.doReset = function () {
            HawtioPreferences.log.info("Resetting preferences");
            $window.localStorage.clear();
            $window.sessionStorage.setItem(SHOW_ALERT, 'true');
            $window.setTimeout(function () {
                $window.location.reload();
            }, 10);
        };
    }
    HawtioPreferences.PreferencesResetController = PreferencesResetController;
})(HawtioPreferences || (HawtioPreferences = {}));
/// <reference path="preferences-registry.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    preferencesConfig.$inject = ["$provide", "$routeProvider"];
    function preferencesConfig($provide, $routeProvider) {
        'ngInject';
        $routeProvider.when('/preferences', { templateUrl: 'plugins/preferences/html/preferences.html', reloadOnSearch: false });
        $provide.decorator('preferencesRegistry', ['$delegate', '$rootScope', function ($delegate, $rootScope) {
                return new HawtioPreferences.PreferencesRegistry($rootScope);
            }]);
    }
    HawtioPreferences.preferencesConfig = preferencesConfig;
})(HawtioPreferences || (HawtioPreferences = {}));
/// <reference path="preferences.service.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    PreferencesController.$inject = ["$scope", "$location", "preferencesRegistry", "preferencesService"];
    function PreferencesController($scope, $location, preferencesRegistry, preferencesService) {
        'ngInject';
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
        $scope.close = function () {
            preferencesService.restoreLocation($location);
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
    }
    HawtioPreferences.PreferencesController = PreferencesController;
})(HawtioPreferences || (HawtioPreferences = {}));
var HawtioPreferences;
(function (HawtioPreferences) {
    preferencesInit.$inject = ["$templateCache", "HawtioExtension", "$compile", "preferencesRegistry", "helpRegistry"];
    function preferencesInit($templateCache, HawtioExtension, $compile, preferencesRegistry, helpRegistry) {
        'ngInject';
        HawtioExtension.add('hawtio-user', function ($scope) {
            var template = $templateCache.get('plugins/preferences/html/preferences-menu-item.html');
            return $compile(template)($scope);
        });
        HawtioPreferences.log.debug("loaded");
        helpRegistry.addUserDoc('preferences', 'plugins/preferences/doc/help.md');
        preferencesRegistry.addTab("Logging", 'plugins/preferences/html/preferences-logging.html');
        preferencesRegistry.addTab("Reset", 'plugins/preferences/html/preferences-reset.html');
    }
    HawtioPreferences.preferencesInit = preferencesInit;
})(HawtioPreferences || (HawtioPreferences = {}));
/// <reference path="preferences.config.ts"/>
/// <reference path="preferences.init.ts"/>
/// <reference path="preferences.service.ts"/>
/// <reference path="preferences.controller.ts"/>
/// <reference path="preferences-logging.controller.ts"/>
/// <reference path="preferences-menu-item.controller.ts"/>
/// <reference path="preferences-reset.controller.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    var pluginName = 'hawtio-preferences';
    HawtioPreferences.log = Logger.get(pluginName);
    angular
        .module(pluginName, [])
        .config(HawtioPreferences.preferencesConfig)
        .run(HawtioPreferences.preferencesInit)
        .controller('HawtioPreferences.PreferencesController', HawtioPreferences.PreferencesController)
        .controller('HawtioPreferences.PreferencesLoggingController', HawtioPreferences.PreferencesLoggingController)
        .controller('HawtioPreferences.PreferencesMenuItemController', HawtioPreferences.PreferencesMenuItemController)
        .controller('HawtioPreferences.PreferencesResetController', HawtioPreferences.PreferencesResetController)
        .service('preferencesService', HawtioPreferences.PreferencesService);
    hawtioPluginLoader.addModule(pluginName);
})(HawtioPreferences || (HawtioPreferences = {}));

angular.module("hawtio-preferences-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/preferences/html/preferences-logging.html","<div ng-controller=\"HawtioPreferences.PreferencesLoggingController\">\n  <div hawtio-form-2=\"config\" entity=\"entity\"></div>\n</div>\n");
$templateCache.put("plugins/preferences/html/preferences-menu-item.html","<li ng-controller=\"HawtioPreferences.PreferencesMenuItemController\">\n  <a href=\"\" ng-click=\"gotoPreferences()\">Preferences</a>\n</li>\n");
$templateCache.put("plugins/preferences/html/preferences-reset.html","<div ng-controller=\"HawtioPreferences.PreferencesResetController\">\n  <div class=\"alert alert-success preferences-reset-alert\" ng-if=\"showAlert\">\n    <span class=\"pficon pficon-ok\"></span>\n    Settings reset successfully!\n  </div>\n  <h3>Reset settings</h3>\n  <p>\n    Clear all custom settings stored in your browser\'s local storage and reset to defaults.\n  </p>\n  <p>\n    <button class=\"btn btn-danger\" ng-click=\"doReset()\">Reset settings</button>\n  </p>\n</div>");
$templateCache.put("plugins/preferences/html/preferences.html","<div ng-controller=\"HawtioPreferences.PreferencesController\">\n  <button class=\"btn btn-primary pull-right\" ng-click=\"close()\">Close</button>\n  <h1>\n    Preferences\n  </h1>\n  <ul class=\"nav nav-tabs\" hawtio-auto-dropdown>\n    <li ng-repeat=\"name in names\" ng-class=\"active(name)\">\n      <a href=\"#\" ng-click=\"setPanel(name)\">{{name}}</a>\n    </li>\n    <li class=\"dropdown overflow\">\n      <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n        More <span class=\"caret\"></span>\n      </a>\n      <ul class=\"dropdown-menu\" role=\"menu\"></ul>\n    </li>\n  </ul>\n  <div ng-include=\"getPrefs(pref)\"></div>\n</div>\n");
$templateCache.put("plugins/preferences/doc/help.md","### Preferences\n\nThe preferences page is used to configure application preferences and individual plugin preferences.\n\nThe preferences page is accessible by clicking the user icon (<i class=\'fa pficon-user\'></i>) in the main navigation bar,\nand then by choosing the preferences sub menu option.\n");}]); hawtioPluginLoader.addModule("hawtio-preferences-templates");