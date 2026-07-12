import { getCompetency, getCompetencies } from './lib/content';

const c = getCompetency("revisao-da-literatura");
console.log(JSON.stringify(c, null, 2));
