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
            this.$window.sessionStorage.setItem('lastSearch', JSON.stringify($location.search()));
        };
        PreferencesService.prototype.restoreLocation = function ($location) {
            $location
                .path(this.$window.sessionStorage.getItem('lastPath'))
                .search(JSON.parse(this.$window.sessionStorage.getItem('lastSearch')));
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
        $routeProvider.when('/preferences', { templateUrl: HawtioPreferences.templatesLocation + 'preferences.html', reloadOnSearch: false });
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
            var template = $templateCache.get(HawtioPreferences.templatesLocation + 'preferences-menu-item.html');
            return $compile(template)($scope);
        });
        HawtioPreferences.log.debug("loaded");
        helpRegistry.addUserDoc('preferences', 'plugins/preferences/doc/help.md');
        preferencesRegistry.addTab("Console Logging", HawtioPreferences.templatesLocation + 'logging-preferences.html');
        preferencesRegistry.addTab("Reset", HawtioPreferences.templatesLocation + 'preferences-reset.html');
    }
    HawtioPreferences.preferencesInit = preferencesInit;
})(HawtioPreferences || (HawtioPreferences = {}));
var HawtioPreferences;
(function (HawtioPreferences) {
    var LoggingPreferencesService = /** @class */ (function () {
        LoggingPreferencesService.$inject = ["$window"];
        function LoggingPreferencesService($window) {
            'ngInject';
            this.$window = $window;
        }
        LoggingPreferencesService.prototype.getLogBuffer = function () {
            if (window.localStorage.getItem('logBuffer') !== null) {
                return parseInt(this.$window.localStorage.getItem('logBuffer'), 10);
            }
            else {
                return 100;
            }
        };
        LoggingPreferencesService.prototype.setLogBuffer = function (logBuffer) {
            this.$window.localStorage.setItem('logBuffer', logBuffer.toString());
        };
        LoggingPreferencesService.prototype.getGlobalLogLevel = function () {
            if (this.$window.localStorage.getItem('logLevel') !== null) {
                return JSON.parse(this.$window.localStorage.getItem('logLevel'));
            }
            else {
                return Logger.INFO;
            }
        };
        LoggingPreferencesService.prototype.setGlobalLogLevel = function (logLevel) {
            this.$window.localStorage.setItem('logLevel', JSON.stringify(logLevel));
            Logger.setLevel(logLevel);
            this.getChildLoggers().forEach(function (childLogger) {
                Logger.get(childLogger.name).setLevel(childLogger.filterLevel);
            });
        };
        LoggingPreferencesService.prototype.getChildLoggers = function () {
            if (this.$window.localStorage.getItem('childLoggers') !== null) {
                return JSON.parse(this.$window.localStorage.getItem('childLoggers'));
            }
            else {
                return [];
            }
        };
        LoggingPreferencesService.prototype.getAvailableChildLoggers = function () {
            var allChildLoggers = _.values(Logger['loggers']).map(function (obj) { return obj['context']; });
            var childLoggers = this.getChildLoggers();
            var availableChildLoggers = allChildLoggers.filter(function (childLogger) { return !childLoggers.some(function (c) { return c.name === childLogger.name; }); });
            return _.sortBy(availableChildLoggers, 'name');
        };
        ;
        LoggingPreferencesService.prototype.addChildLogger = function (childLogger) {
            var childLoggers = this.getChildLoggers();
            childLoggers.push(childLogger);
            this.saveChildLoggers(childLoggers);
        };
        LoggingPreferencesService.prototype.removeChildLogger = function (childLogger) {
            var childLoggers = this.getChildLoggers();
            _.remove(childLoggers, function (c) { return c.name === childLogger.name; });
            this.saveChildLoggers(childLoggers);
            Logger.get(childLogger.name).setLevel(this.getGlobalLogLevel());
        };
        LoggingPreferencesService.prototype.saveChildLoggers = function (childLoggers) {
            this.$window.localStorage.setItem('childLoggers', JSON.stringify(childLoggers));
        };
        return LoggingPreferencesService;
    }());
    HawtioPreferences.LoggingPreferencesService = LoggingPreferencesService;
})(HawtioPreferences || (HawtioPreferences = {}));
/// <reference path="logging-preferences.service.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    LoggingPreferencesController.$inject = ["$scope", "loggingPreferencesService"];
    function LoggingPreferencesController($scope, loggingPreferencesService) {
        'ngInject';
        // Initialize tooltips
        $('[data-toggle="tooltip"]').tooltip();
        $scope.logBuffer = loggingPreferencesService.getLogBuffer();
        $scope.logLevel = loggingPreferencesService.getGlobalLogLevel();
        $scope.childLoggers = loggingPreferencesService.getChildLoggers();
        $scope.availableChildLoggers = loggingPreferencesService.getAvailableChildLoggers();
        $scope.availableLogLevels = [Logger.OFF, Logger.ERROR, Logger.WARN, Logger.INFO, Logger.DEBUG];
        $scope.onLogBufferChange = function (logBuffer) { return loggingPreferencesService.setLogBuffer(logBuffer); };
        $scope.onLogLevelChange = function (logLevel) { return loggingPreferencesService.setGlobalLogLevel(logLevel); };
        $scope.addChildLogger = function (childLogger) {
            loggingPreferencesService.addChildLogger(childLogger);
            $scope.childLoggers = loggingPreferencesService.getChildLoggers();
            $scope.availableChildLoggers = loggingPreferencesService.getAvailableChildLoggers();
        };
        $scope.removeChildLogger = function (childLogger) {
            loggingPreferencesService.removeChildLogger(childLogger);
            $scope.childLoggers = loggingPreferencesService.getChildLoggers();
            $scope.availableChildLoggers = loggingPreferencesService.getAvailableChildLoggers();
        };
        $scope.onChildLoggersChange = function (childLoggers) { return loggingPreferencesService.saveChildLoggers(childLoggers); };
    }
    HawtioPreferences.LoggingPreferencesController = LoggingPreferencesController;
})(HawtioPreferences || (HawtioPreferences = {}));
/// <reference path="logging-preferences.controller.ts"/>
/// <reference path="logging-preferences.service.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    var pluginName = 'hawtio-logging-preferences';
    HawtioPreferences.loggingPreferencesModule = angular
        .module(pluginName, [])
        .controller('HawtioPreferences.PreferencesLoggingController', HawtioPreferences.LoggingPreferencesController)
        .service('loggingPreferencesService', HawtioPreferences.LoggingPreferencesService)
        .name;
})(HawtioPreferences || (HawtioPreferences = {}));
/// <reference path="preferences.config.ts"/>
/// <reference path="preferences.init.ts"/>
/// <reference path="preferences.service.ts"/>
/// <reference path="preferences.controller.ts"/>
/// <reference path="preferences-menu-item.controller.ts"/>
/// <reference path="preferences-reset.controller.ts"/>
/// <reference path="logging-preferences/logging-preferences.module.ts"/>
var HawtioPreferences;
(function (HawtioPreferences) {
    var pluginName = 'hawtio-preferences';
    HawtioPreferences.log = Logger.get(pluginName);
    HawtioPreferences.templatesLocation = 'plugins/preferences/html/';
    angular
        .module(pluginName, [
        HawtioPreferences.loggingPreferencesModule
    ])
        .config(HawtioPreferences.preferencesConfig)
        .run(HawtioPreferences.preferencesInit)
        .controller('HawtioPreferences.PreferencesController', HawtioPreferences.PreferencesController)
        .controller('HawtioPreferences.PreferencesMenuItemController', HawtioPreferences.PreferencesMenuItemController)
        .controller('HawtioPreferences.PreferencesResetController', HawtioPreferences.PreferencesResetController)
        .service('preferencesService', HawtioPreferences.PreferencesService);
    hawtioPluginLoader.addModule(pluginName);
})(HawtioPreferences || (HawtioPreferences = {}));

angular.module("hawtio-preferences-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/preferences/html/logging-preferences.html","<div ng-controller=\"HawtioPreferences.PreferencesLoggingController\">\n  <form class=\"form-horizontal logging-preferences-form\">\n    <div class=\"form-group\">\n      <label class=\"col-md-2 control-label\" for=\"log-buffer\">\n        Log buffer\n        <span class=\"pficon pficon-info\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Number of log statements to keep in the console\"></span>\n      </label>\n      <div class=\"col-md-6\">\n        <input type=\"number\" id=\"log-buffer\" class=\"form-control\" ng-model=\"logBuffer\" ng-change=\"onLogBufferChange(logBuffer)\">\n      </div>\n    </div>\n    <div class=\"form-group\">\n      <label class=\"col-md-2 control-label\" for=\"log-level\">Global log level</label>\n      <div class=\"col-md-6\">\n        <select id=\"log-level\" class=\"form-control\" ng-model=\"logLevel\"\n                ng-options=\"logLevel.name for logLevel in availableLogLevels track by logLevel.name\"\n                ng-change=\"onLogLevelChange(logLevel)\">\n        </select>\n      </div>\n    </div>\n    <div class=\"form-group\">\n      <label class=\"col-md-2 control-label\" for=\"log-buffer\">Child loggers</label>\n      <div class=\"col-md-6\">\n        <div class=\"form-group\" ng-repeat=\"childLogger in childLoggers track by childLogger.name\">\n          <label class=\"col-md-4 control-label child-logger-label\" for=\"log-level\">\n            {{childLogger.name}}\n          </label>\n          <div class=\"col-md-8\">\n            <select id=\"log-level\" class=\"form-control child-logger-select\" ng-model=\"childLogger.filterLevel\"\n                    ng-options=\"logLevel.name for logLevel in availableLogLevels track by logLevel.name\"\n                    ng-change=\"onChildLoggersChange(childLoggers)\">\n            </select>\n            <button type=\"button\" class=\"btn btn-default child-logger-delete-button\" ng-click=\"removeChildLogger(childLogger)\">\n              <span class=\"pficon pficon-delete\"></span>\n            </button>\n          </div>\n        </div>\n        <div>\n          <div class=\"dropdown\">\n            <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"addChildLogger\" data-toggle=\"dropdown\">\n              Add\n              <span class=\"caret\"></span>\n            </button>\n            <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"addChildLogger\">\n              <li role=\"presentation\" ng-repeat=\"availableChildLogger in availableChildLoggers track by availableChildLogger.name\">\n                <a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ng-click=\"addChildLogger(availableChildLogger)\">\n                  {{ availableChildLogger.name }}\n                </a>\n              </li>\n            </ul>\n          </div>          \n        </div>\n      </div>\n    </div>\n  </form>\n</div>\n");
$templateCache.put("plugins/preferences/html/preferences-menu-item.html","<li ng-controller=\"HawtioPreferences.PreferencesMenuItemController\">\n  <a href=\"\" ng-click=\"gotoPreferences()\">Preferences</a>\n</li>\n");
$templateCache.put("plugins/preferences/html/preferences-reset.html","<div ng-controller=\"HawtioPreferences.PreferencesResetController\">\n  <div class=\"alert alert-success preferences-reset-alert\" ng-if=\"showAlert\">\n    <span class=\"pficon pficon-ok\"></span>\n    Settings reset successfully!\n  </div>\n  <h3>Reset settings</h3>\n  <p>\n    Clear all custom settings stored in your browser\'s local storage and reset to defaults.\n  </p>\n  <p>\n    <button class=\"btn btn-danger\" ng-click=\"doReset()\">Reset settings</button>\n  </p>\n</div>");
$templateCache.put("plugins/preferences/html/preferences.html","<div ng-controller=\"HawtioPreferences.PreferencesController\">\n  <button class=\"btn btn-primary pull-right\" ng-click=\"close()\">Close</button>\n  <h1>\n    Preferences\n  </h1>\n  <ul class=\"nav nav-tabs\" hawtio-auto-dropdown>\n    <li ng-repeat=\"name in names\" ng-class=\"active(name)\">\n      <a href=\"#\" ng-click=\"setPanel(name)\">{{name}}</a>\n    </li>\n    <li class=\"dropdown overflow\">\n      <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n        More <span class=\"caret\"></span>\n      </a>\n      <ul class=\"dropdown-menu\" role=\"menu\"></ul>\n    </li>\n  </ul>\n  <div ng-include=\"getPrefs(pref)\"></div>\n</div>\n");
$templateCache.put("plugins/preferences/doc/help.md","### Preferences\n\nThe preferences page is used to configure application preferences and individual plugin preferences.\n\nThe preferences page is accessible by clicking the user icon (<i class=\'fa pficon-user\'></i>) in the main navigation bar,\nand then by choosing the preferences sub menu option.\n");}]); hawtioPluginLoader.addModule("hawtio-preferences-templates");