/// <reference path="preferencesPlugin.ts"/>
/// <reference path="preferenceHelpers.ts"/>
module HawtioPreferences {

  _module.controller("HawtioPreferences.LoggingPreferences", ["$scope", "SchemaRegistry", ($scope, schemas) => {

    function getLoggers() {
      var allLoggers = Logger['loggers'];
      var allLoggersEnum = _.keys(allLoggers);
      var theEnum = {};
      _.forIn(allLoggers, (value, key) => {
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
          enum: levelEnum
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
      _.forEach($scope.childLoggers, (child:any) => {
        Logger.get(child.logger).setLevel(Logger[child.level]);
      });
    }

    $scope.$watch('globalLogLevel', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        localStorage['logLevel'] = angular.toJson(Logger[newValue]);
        Logger.setLevel(Logger[newValue]);
        // the above overwrites child loggers according to the doc
        setChildLoggers();
      } else {
        try {
          $scope.globalLogLevel = angular.fromJson(localStorage['logLevel']).name;
        } catch (e) {
          $scope.globalLogLevel = 'INFO';
        }
        setChildLoggers();
      }
    });

    $scope.$watchCollection('childLoggers', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        localStorage['childLoggers'] = angular.toJson(newValue);
        setChildLoggers();
      } else {
        try {
          $scope.childLoggers = angular.fromJson(localStorage['childLoggers']);
        } catch (e) {
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
        'post': (newValue) => {
          window['LogBuffer'] = newValue;
        }  
      }
    });
  }]);
}
