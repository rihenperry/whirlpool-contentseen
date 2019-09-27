import DiceExtract from '../plugins/dice';
import SimplyHiredExtract from '../plugins/simplyhired.js';
import MonsterJobsExtract from '../plugins/monster.js';

const injector = {
  deps: {},
  register: function(k, v) {
    this.deps[k] = v;
  },
  resolve: function(k) {
    return this.deps[k];
  }
};

injector.register(DiceExtract._domain, DiceExtract);
injector.register(SimplyHiredExtract._domain, SimplyHiredExtract);
injector.register(MonsterJobsExtract._domain, MonsterJobsExtract);
injector.register(MonsterJobsExtract._otherdomain, MonsterJobsExtract);

export default injector;
