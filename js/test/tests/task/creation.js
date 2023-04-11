'use strict';
/**
* Test pour tester la création d'une tâche, jusqu'à son enregistrement
*/

const newTaskResume = "Tester la création d'une tâche"

Test.testCreationTask = () => {
  DGet('#task-resume',editor).value = newTaskResume
  // DGet('#task-cat').value = '__new__cate__'
  simulateNewCategorie().then( _ => {
    /* - Réglage de la catégorie (nouvelle) */
    const divMsg = DGet('div.inter-conteneur')
    DGet('input.prompt-field[value="Nouvelle catégorie"]').value = "Tâche de test"
    clickOn(DGet('button.btn-ok', divMsg))
    return wait(0.5)
  })
  .then( _ => {
    /* Choix de l'action */
    DGet('select#task-atype', editor).value = 'bcode'
    DGet('textarea#task-action',editor).value = 'say "Ça roule ma poule"'
    return wait(0.5)
  })
  .then( _ => {
    /* Enregistrement final de la tâche (création) */
    clickOn(DGet('button#task-editor-btn-save',editor))
    return wait(1)
  })
  .then( _ => {
    /* Vérification finale */
    const newTaskId = 1 + Test.TestLastId
    // - il doit y avoir une tâche de plus
    var exp = Test.currentTaskCount + 1
    var act = Task.count
    assert(exp, act, "Il devrait y avoir ${exp} tâches. Il y en a ${act}")
    // - on doit trouver la tâche dans la liste affichée
    const taskObj = DGet(`div#container-tasks-main div.task#task-${newTaskId}`)
    refute(undefined, act, "La nouvelle tâche devrait se trouver dans la liste")
    // - la nouvelle tâche dans la liste doit être visible
    refute(true, taskObj.classList.contains('hidden'), "La nouvelle tâche devrait être visible.")
    // - La nouvelle tâche est la dernière de la liste (à cause de sa date et de sa priorité) -
    const dispTasks = displayedTaskObjects()
    const tasko = dispTasks[3]
    exp = `task-${newTaskId}`
    act = tasko.id
    assert(exp, act, "L'objet de la tâche devrait être en 4e position (l'id du 4e élément est ${act} au lieu de ${exp}.")
    // - Le résumé de la tâche est bon -
    exp = newTaskResume
    act = DGet('span.resume', tasko).innerHTML
    assert(exp, act, "Le résumé de la nouvelle tâche devrait être “${exp}”. Il vaut ${act}…")

    // - la table des tâches contient la nouvelle tâche
    act = Task.table[newTaskId]
    refute(undefined, act, "La nouvelle tâche devrait être définie dans Task.table")
    // - lastId a changé
    exp = newTaskId
    act = Task.lastId
    assert(exp, act, "Test.lastId devrait valoir ${exp}. Il vaut ${act}.")
    // - on doit trouver le message de confirmation de l'enregistrement -
    return wait(1)
  })
  .then( _ => {
    // - la tâche doit être enregistrée sur le disque (asynchrone)

  })
  .then(next)
}


Test.preTestCreationTask = _ => {
  // Prendre le nombre de tâches courantes
  Test.currentTaskCount = Task.count
  Test.TestLastId = Task.lastId

  /* - On clique sur le bouton '+' - */
  clickOn(btnPlus)
  /* - On attend que l'éditeur s'ouvre pour créer la tâche - */
  waitFor(taskEditorOpened)
  .then(Test.testCreationTask.bind(Test))
}


Test.reloadAppInTestMode()
.then(Test.preTestCreationTask.bind(Test))
