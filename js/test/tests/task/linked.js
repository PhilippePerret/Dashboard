'use strict';
/**
* Pour tester la liaison des tâches
* 
* - création de deux tâches liées
* - déclenchement d'une tâche liée quand sa tâche précédente
*   est accomplie/détruite
* (avec tous les contrôles qui s'imposent)
* 
* Pour ne jouer que ce test :
* - éditer test/Test.js
* - mettre "task/linked" dans la constante TEST_FILES
*/
var exp, act ;

App.resetAll()


console.info("Je suis prêt.")

console.info("Je crée une tâche")
clickOn(btnPlus)
waitFor(Editor.ready)
.then( _ => {
  Editor.resume = "Ma toute première tâche"
  Editor.todo   = ""
  Editor.save()
  return wait(1)
})
.then( _ => {
  console.info("On vérifie que la tâche a bien été créée")
  Message.assert_contains("Tâche #1 enregistrée avec succès.")
  exp = 1 ; act = Task.count
  assert(exp, act, "Il devrait y avoir 1 tâche, il y en a ${actual}…")
  return wait(0)
})
.then( _ => {
  console.info("Création de la deuxième tâche (suivante)")
  clickOn(btnPlus)
  return waitFor(Editor.ready)
})
.then( _ => {
  console.info("L'éditeur est prêt")
  Editor.resume = "La deuxième tâche qui doit suivre."
  Editor.todo   = ""
  Editor.save()
  return wait(1)
})
.then( _ => {
  Message.assert_contains("Tâche #2 enregistrée avec succès.")
  exp = 2 ; act = Task.count
  assert(exp, act, "Il devrait y avoir 2 tâches, il y en a ${act}…")
  return wait(0)
})
.then( _ => {
  console.info("On va pouvoir lier les deux tâches")
  // On sélectionne la deuxième tâche créée
  clickOn_task(2)
  // On clique sur le bouton pour lier
  clickOn(btnLink)
  // Un message d'erreur précise qu'il faut définir la durée
  Message.assert_contains_error("Il faut absolument définir la durée")
//   return wait(1)
// })
// .then( _ => {

  const task1 = Task.get(1)
  const task2 = Task.get(2)

  // L'éditeur doit être ouvert
  assert(true, Editor.ready(), "L'éditeur devrait être ouvert")
  assert(2, Editor.task.id, "L'éditeur devrait éditer la tâche #2, il édite la tâche #"+Editor.task.id)
  // On règle la durée de la tâche
  Editor.dureeNombre = 4
  Editor.dureeUnite  = 'jour'
  // On enregistre
  Editor.save()
  assert(false, Editor.ready(), "L'éditeur ne devrait plus être ouvert.")
  // Les nouvelles données de la tâche doivent être bonnes
  exp = '4:d' ; act = task2.data.duree
  assert(exp, act, "La durée de la tâche #2 devrait être ${exp}. Elle vaut ${act}.")
  // On reclique sur le bouton pour lier
  clickOn(btnLink)
  // On clique sur la première tâche
  clickOn_task(1)
  // On clique sur le OK du message interactif
  const iMsg = IMessage.getWithMessage("Choisis la tâche précédente")
  assert(true, iMsg.exists, "Le message interactif devrait exister…")
  clickOn(iMsg.btnOK)
  // La tâche devrait être liée
  exp = ['1'] ; act = task2.data.prev
  assert(exp, act, "La tâche précédente de la tâche #2 devrait être la tâche #1. Son data.prev vaut ${act}.")
  // La tâche ne devrait plus être affichée
  Task.refute_isDisplayed(2)
  // La première tâche devrait l'être
  Task.assert_isDisplayed(1)
  // La première tâche devrait connaitre sa suivante
  act = task1.nextTasks.includes(task2)
  if ( ! act ) {
    console.error("task1.nextTasks contient : ", task1.nextTasks)
  }
  assert(true, act, "La tâche #1 devrait contenir la tâche #2 dans ses suivantes…")
  // Les deux tâches doivent être marquées liées (trombone)
  refute(true, task1.isLinked, "La première tâche (#1) ne devrait pas être marquée liée… (isLinked)")
  assert(true, task1.obj.classList.contains('linked'), "La tâche #1 devrait avoir une chaine… (class css 'linked')")
  assert(true, task2.isLinked, "La deuxième tâche (#2) devrait être marquée liée…")
  assert(true, task2.obj.classList.contains('linked'), "La tâche #1 devrait avoir une chaine… (class css 'linked')")
  return wait(1)
})
.then( _ => {
  /* On test l'affichage des deux tâches quand le filtre "les liées" est choisis */
  clickOn_task(1)
  Task.display_list('linked')
  return wait(0.5)
})
.then( _ => {
  Task.assert_isDisplayed(1)  
  Task.assert_isDisplayed(2)  
  console.info("Les deux tâches sont affichées")
  return wait(0)
})
.then( _ => {
  console.warn("On doit tester la mise en route d'une tâche liées (et son réglage) quand la tâche précédente est marquée accomplie.")
  return wait(1)
})
.then(next)

