'use strict';

var exp, act ;

App.resetAll()
clickOn(btnPlus)
waitFor(Editor.ready)
.then( _ => {
  expect("La date de fin d'une tâche doit se calculer en fonction de sa date de départ.")
  action("Création d'une nouvelle tâche")
  Editor.resume = "Pour modification de la durée et résultat sur le temps de fin"
  Editor.save()
  return wait(INTERTIME)
})
.then( _ => {
  action("On édite la tâche pour modifier son temps de départ et sa durée")
  const task = Task.getLastCreated()
  clickOn_task(task)
  clickOn(btnEdit)
  console.log("Editor.end au départ", Editor.end)
  const demain = NOW.plus(2,'jour',true).asRevdate()
  Editor.start = demain
  simulateNewDuree(4, 'jour')
  act = Editor.end
  exp = NOW.plus(6,'jour',true).asRevdate()
  assert(exp, act, "La date de fin devrait être ${exp}. Or elle vaut ${act}…")
  Editor.save()
  return wait(INTERTIME)
})
.then(_ => {
  const task = Task.getLastCreated()
  act = task.data.end
  exp = NOW.plus(6,'jour',true).asRevdate()
  assert(exp, act, "La date de fin enregistrée de la tâche devrait être ${exp}.Or elle vau ${act}.")
})
.then(next)
