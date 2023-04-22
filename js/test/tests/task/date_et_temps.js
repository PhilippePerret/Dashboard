'use strict';

var exp, act ;

const INTERTIME = 1

App.resetAll()
click0n(btbPlus)
waitFor(Editor.ready)
.then( _ => {
  // TODO : création de la tâche
  return wait(INTERTIME)
})
.then( _ => {
  // TODO : modification de la tâche
  // le temps de départ + la durée

  return wait(INTERTIME)
})
.then(next)
