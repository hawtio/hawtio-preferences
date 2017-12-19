namespace HawtioPreferences {

  export class PreferencesRegistry {

    private tabs: any = {};

    constructor(private $rootScope: ng.IRootScopeService) {
    }

    addTab(name: string, template: string, isValid: () => boolean = undefined) {
      if (!isValid) {
        isValid = () => { return true; };
      }
      this.tabs[name] = {
        template: template,
        isValid: isValid
      };
      this.$rootScope.$broadcast('HawtioPreferencesTabAdded');
      Core.$apply(this.$rootScope);
    }

    getTab(name: string) {
      return this.tabs[name];
    }

    getTabs() {
      var answer = {};
      angular.forEach(this.tabs, (value, key) => {
        if (value.isValid()) {
          answer[key] = value;
        }
      });
      return answer;
    }

  }

}
