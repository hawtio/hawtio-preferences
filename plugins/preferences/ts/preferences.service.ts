namespace HawtioPreferences {

  export class PreferencesService {

    constructor(private $window: ng.IWindowService) {
      'ngInject';
    }

    saveLocation($location: ng.ILocationService) {
      this.$window.sessionStorage.setItem('lastPath', $location.path());
      this.$window.sessionStorage.setItem('lastSearch', $location.search());
    }

    restoreLocation($location: ng.ILocationService) {
      $location
        .path(this.$window.sessionStorage.getItem('lastPath'))
        .search(this.$window.sessionStorage.getItem('lastSearch'));
    }

    /**
     * Parsers the given value as JSON if it is define
     */
    parsePreferencesJson(value, key) {
      var answer = null;
      if (angular.isDefined(value)) {
        answer = Core.parseJsonText(value, "localStorage for " + key);
      }
      return answer;
    }

    initPreferenceScope($scope, localStorage, defaults) {
      angular.forEach(defaults, (_default, key) => {
        $scope[key] = _default['value'];
        var converter = _default['converter'];
        var formatter = _default['formatter'];
        if (!formatter) {
          formatter = (value) => { return value; };
        }
        if (!converter) {
          converter = (value) => { return value; };
        }
        if (key in localStorage) {
          var value = converter(localStorage[key]);
          log.debug("from local storage, setting ", key, " to ", value);
          $scope[key] = value;
        } else {
          var value = _default['value'];
          log.debug("from default, setting ", key, " to ", value);
          localStorage[key] = value;
        }

        var watchFunc = _default['override'];
        if (!watchFunc) {
          watchFunc = (newValue, oldValue) => {
            if (newValue !== oldValue) {
              if (angular.isFunction(_default['pre'])) {
                _default.pre(newValue);
              }

              var value = formatter(newValue);
              log.debug("to local storage, setting ", key, " to ", value);
              localStorage[key] = value;

              if (angular.isFunction(_default['post'])) {
                _default.post(newValue);
              }
            }
          }
        }

        if (_default['compareAsObject']) {
          $scope.$watch(key, watchFunc, true);
        } else {
          $scope.$watch(key, watchFunc);
        }

      });


    }

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
    isValidFunction(workspace, validFn, perspectiveId: string): boolean {
      return !validFn || validFn(workspace, perspectiveId);
    }

  }

}
