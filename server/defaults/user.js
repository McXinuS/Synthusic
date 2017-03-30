let usr = require('./../models/user');

let names = [
  'Bolitest',
  'Brilliant',
  'BWithWonder',
  'Cationol',
  'Cutieremi',
  'Discuua',
  'Dressylved',
  'Dryadur',
  'Encover',
  'Flipjava',
  'Gigausaler',
  'Grindie',
  'Haneffe',
  'Helsonix',
  'Hickyawmet',
  'HipurAdvice',
  'Horrayerth',
  'Imervita',
  'LastingMercy',
  'Littler',
  'Magfull',
  'Meresspo',
  'Missonolve',
  'Mithister',
  'Netbanc',
  'Omflower',
  'Paneryat',
  'PassionIcyCooky',
  'PrestigeLeventis'
];
function getRandomName() {
  return names[Math.random() * names.length];
}

const user = new usr(
  -1,
  getRandomName()
);
module.exports = user;
