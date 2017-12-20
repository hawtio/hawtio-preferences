namespace HawtioPreferences {

  export class LoggingPreferencesService {

    constructor(private $window: ng.IWindowService) {
      'ngInject';
    }

    getLogBuffer(): number {
      if (window.localStorage.getItem('logBuffer') !== null) {
        return parseInt(this.$window.localStorage.getItem('logBuffer'), 10);
      } else {
        return 100;
      }
    }

    setLogBuffer(logBuffer: number): void {
      this.$window.localStorage.setItem('logBuffer', logBuffer.toString());
    }

    getGlobalLogLevel(): Logging.LogLevel {
      if (this.$window.localStorage.getItem('logLevel') !== null) {
        return JSON.parse(this.$window.localStorage.getItem('logLevel'));
      } else {
        return Logger.INFO;
      }
    }

    setGlobalLogLevel(logLevel: Logging.LogLevel): void {
      this.$window.localStorage.setItem('logLevel', JSON.stringify(logLevel));
      Logger.setLevel(logLevel);
      this.getChildLoggers().forEach(childLogger => {
        Logger.get(childLogger.name).setLevel(childLogger.filterLevel);
      });
    }
    
    getChildLoggers(): Logging.ChildLogger[] {
      if (this.$window.localStorage.getItem('childLoggers') !== null) {
        return JSON.parse(this.$window.localStorage.getItem('childLoggers'));
      } else {
        return [];
      }
    }

    getAvailableChildLoggers(): Logging.ChildLogger[] {
      const allChildLoggers = _.values(Logger['loggers']).map(obj => obj['context']);
      const childLoggers = this.getChildLoggers();
      const availableChildLoggers = allChildLoggers.filter(childLogger => !childLoggers.some(c => c.name === childLogger.name));
      return _.sortBy(availableChildLoggers, 'name');
    };

    addChildLogger(childLogger: Logging.ChildLogger): void {
      const childLoggers = this.getChildLoggers();
      childLoggers.push(childLogger);
      this.saveChildLoggers(childLoggers);
    }  

    removeChildLogger(childLogger: Logging.ChildLogger): void {
      const childLoggers = this.getChildLoggers();
      _.remove(childLoggers, c => c.name === childLogger.name);
      this.saveChildLoggers(childLoggers);
      Logger.get(childLogger.name).setLevel(this.getGlobalLogLevel());
    }  
    
    saveChildLoggers(childLoggers: Logging.ChildLogger[]): void {
      this.$window.localStorage.setItem('childLoggers', JSON.stringify(childLoggers));
    }

  }

}
