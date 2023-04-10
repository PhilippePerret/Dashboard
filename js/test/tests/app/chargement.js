'use strict';
let expected, actual ;
let exp, act ;

// Chargement des tâches en essai dans le dossier
Task.loadAndDisplayAllTasks()

// waitFor(function(){return App.isReady == true}).then(_ => {
waitFor(function(){return App.isReady == true})
.then( _ => {

  /*
  |  On vérifie que les tâches soient bien définies
  */
  expected = 5
  actual = Task.items.length
  assert(expected, actual, "Il devrait y avoir ${expected} tâches. Il y en a ${actual}…")

  /*
  |  La tâche #1
  |     - sans fin et débute le 10 avril 2023
  |     - doit être affichée
  |     - ne doit pas avoir de catégorie
  */
  const task1 = Task.get(1)
  assert(true, task1 instanceof Task, "La première tâche devrait être une instance de tâche")
  exp = "2023-04-10"; act = task1.data.start
  assert(exp, act, "[Tâche #1] Le start devrait être ${exp}. Il faut ${act}.")
  exp = new Date(2023,3,10).getTime() ; act = task1.start_at.getTime()
  assert(exp, act, "[Tâche #1] Sa date de démarrage devrait être ${exp}. Elle vaut ${act}.")
  exp = true ; act = task1.obj.classList.contains('hidden')
  refute(exp, act, "La tâche #1 devrait être visible.")
  exp = null ; act = task1.categorie
  assert(exp, act, "La tâche #1 ne devrait pas avoir de catégorie")

  /*
  |  La tâche #2
  |     - dépassée (depuis le 11 avril 2022)
  |     - sa suivante doit être la #4
  |     - catégorie 'TEST'
  */  
  const task2 = Task.get(2)
  assert(true, task2 instanceof Task, "La tâche #2 devrait être une instance de tâche")
  exp = 'TEST' ; act = task2.categorie
  assert(exp, act, "La tâche #2 devrait être de la catégorie ${exp}. Elle est de la catégorie ${act}.")

  /*
  |  Il ne devrait pas y avoir de tâche #3
  */
  const task3 = Task.get(3)
  refute(true, task3 instanceof Task, "La tâche #3 ne devrait pas exister.")

  /*
  |  La tâche 4
  |     - doit être liée à #2 (en tant suivante)
  |     - ne doit pas être affichée (puisque liée)
  |     - catégorie 'TEST'
  */
  const task4 = Task.get(4)
  assert(true, task4 instanceof Task, "La tâche #4 devrait être une instance de tâche")
  exp = true ; act = task4.obj.classList.contains('hidden')
  assert(exp, act, "La tâche #4 ne devrait pas être affichée.")
  exp = 'TEST' ; act = task4.categorie
  assert(exp, act, "La tâche #4 devrait être de la catégorie ${exp}. Elle est de la catégorie ${act}.")

  /*
  |  La tâche #12
  |     - doit être une instance de Task
  |     - doit être affichée
  |
  */  
  const task12 = Task.get(12)
  assert(true, task12 instanceof Task, "La tâche #12 devrait être une instance de tâche")
  exp = false ; act = task12.obj.classList.contains('hidden')
  assert(exp, act, "La tâche #12 devrait être visible.")


  /*
  |  La tâche #25
  |     - de catégorie 'TEST'
  |     - a une action définie
  |     - priorité de 9 => doit être au-dessus
  |     - devrait être une tâche future, pas une tâche courante
  |     - ne doit pas être affichée (mise toujours à plus tard)
  |
  */
  const task25 = Task.get(25)
  assert(true, task25 instanceof Task, "La tâche #25 devrait être une instance de tâche")
  exp = 9 ; act = task25.priority
  assert(exp, act, `La priorité de la tâche #25 devrait être ${exp}. Elle vaut ${act}.`)
  exp = false ; act = task25.isCurrent
  assert(exp, act, "La tâche #25 ne devrait pas être une tâche courante.")
  exp = true ; act = task25.isFuture
  assert(exp, act, "La tâche #25 devrait être une tâche future.")

  /*
  |  Le dernier ID de tâche doit être #25
  |  
  */
  exp = 25 ; act = Task.lastId
  assert(exp, act, "Task.lastId devrait valoir ${expected}. Il est à ${actual}.")

  next()
})
.catch(err => {
  add_failure("L'application n'est pas prête.")
})
