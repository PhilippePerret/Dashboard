'use strict';
/**
* Module contenant les éléments requis
*/

/* - Bouton pour créer une nouvelle tâche - */
const btnPlus = DGet('div#container-tasks-main footer button.btn-add')
const btnLink = DGet('div#container-tasks-main footer button.btn-lnk')


const UNITES_DUREES = {
  'm':'m', 'mois':'m', 'month':'m',
  'j':'d', 'jour':'d', 'day':'d',
  'h':'h', 'heure':'h',
  'w':'w', 'semaine':'w', 'week':'w',
  'y':'y', 'année':'y', 'year':'y'
}
/**
* Class facilitante pour gérer l'éditeur (cf. le manuel-test)
*/
class Editor {
  // - Éléments (raccourcis) -
  static get editor(){return TaskEditor.editor}
  static get task(){return this.editor.task}
  // - Interaction avec les champs -
  static set resume(v){this.resumeField.value = v}
  static get resume(){return this.resumeField.value}
  static set start(v){this.startField.value = v}
  static get start(){return this.startField.value}
  static set end(v){this.endField.value = v}
  static get end(){return this.endField.value}
  static set priority(v){this.priorityField.value = v}
  static get priority(){return this.priorityField.value}
  static set dureeNombre(v){this.dureeNombreField.value = v}
  static get dureeNombre(){return this.dureeNombreField.value}
  static set dureeUnite(v){this.dureeUniteField.value = UNITES_DUREES[v]}
  static get dureeUnite(){return this.dureeUniteField.value}
  static set todo(v){this.todoField.value = v}
  static get todo(){return this.todoField.value}
  // - Action -
  static save(){ clickOn(this.saveBtn) }
  // - États -
  static ready(){return TaskEditor.ready === true} // ATTENTION ! MÉTHODE (Editor.ready())
  // - DOM éléments -
  static get obj(){return this._obj || (this._obj = DGet('div#task-editor'))}
  static get resumeField(){return this._resufield || (this._resufield = DGet('#task-resume', this.obj))}
  static get startField(){return this._startfield || (this._startfield = DGet('#task-start', this.obj))}
  static get endField(){return this._endfield || (this._endfield = DGet('#task-end', this.obj))}
  static get priorityField(){return this._priorityfield || (this._priorityfield = DGet('#task-priority', this.obj))}
  static get dureeNombreField(){return this._durnbfield || (this._durnbfield = DGet('#task-duree-nombre', this.obj))}
  static get dureeUniteField(){return this._durunitfield || (this._durunitfield = DGet('#task-duree-unite', this.obj))}
  static get todoField(){return this._todofield || (this._todofield = DGet('#task-todo', this.obj))}
  static get saveBtn(){return this._savebtn || (this._savebtn = DGet('#task-editor-btn-save',this.obj))}
  static get cancelBtn(){return this._cancelbtn || (this._cancelbtn = DGet('#task-editor-btn-cancel',this.obj))}
}

/* - La boite de l'éditeur - */
const editor = Editor.obj

/**
* Extensions de la class Task pour les tests
* Cf. le manuel
*/

Task.display_list = function(type){
  const menuFiltre = DGet('select#task-filter')
  menuFiltre.value = type
  menuFiltre.dispatchEvent(new Event('change'))
}

Task.taskForReal = function(tk){
  if ( 'number' == typeof tk ) { tk = Task.get(tk) }
  return tk
}
Task.assert_isDisplayed = function(tk, cont){
  tk = this.taskForReal(tk)
  assert(false, tk.obj.classList.contains('hidden'), `La tâche ${tk.id} devrait être affichée…`)
  if ( cont ) {
    refute(null, DGet(`#task-${tk.id}`, DGet(`div#container-tasks-${cont}`)), `La tâche ${tk.id} devrait être affichée dans le conteneur '${cont}'…`)
  }
}
Task.refute_isDisplayed = function(tk,cont){
  tk = this.taskForReal(tk)
  if ( cont ) {
    const latache = DGet(`#task-${tk.id}`, DGet(`div#container-tasks-${cont}`))
    if ( latache /* elle existe dans le conteneur */ ) {
      // => on continue pour vérifier son état hidden
    } else {
      add_success(`La tâche #${tk.id} n'est pas affichée dans le conteneur '${cont}'.`)
    }
  }
  refute(false, tk.obj.classList.contains('hidden'), `La tâche #${tk.id} ne devrait pas être affichée…`)
}

/**
* @async
* 
* Pour recharger la base de l'application en mode test (c'est-à-dire
* les 5 tâches de test)
* 
* @usage
* 
*   Test.reloadAppInTestMode()
*   .then(Test.<methode du test>.bind(Test))
*/
Test.reloadAppInTestMode = function(retour){
  if ( undefined == retour ) { return AppLoader.load() }
  else {
    // Chargement des tâches en essai dans le dossier
    Task.loadAndDisplayAllTasks()
    // On attend que l'application soit prête pour commencer
    waitFor(function(){return App.isReady == true}).then(AppLoader.onOk)
  }
}

class AppLoader {
  static load(){
    return new Promise((ok,ko) => {
      this.onOk = ok
      this.onKo = ko
      WAA.send({class:'WAATest', method:'customInit', data:{poursuivre:'reloadAppInTestMode'}})
    })
  }
}

function clickOn_task(task_id){
  clickOn(Task.get(task_id).obj)
}

/**
* Simulation de la sélection du menu "Autre…" des catégories
* (pour en créer une nouvelle)
* 
* Il faut ensuite entrer la nouvelle catégorie avec :
*     const divMsg = DGet('div.inter-conteneur')
*     DGet('input.prompt-field[value="Nouvelle catégorie"]').value = "<nom catégorie>"
* Puis valider avec : 
*     clickOn(DGet('button.btn-ok', divMsg))
* 
*/
function simulateNewCategorie(){
  DGet('select#task-cat').selectedIndex = DGetAll('select#task-cat option').length - 1
  DGet('select#task-cat').dispatchEvent(new Event('change'))
  return wait(1)
}

/**
* Retourne la liste des tâches affichées
* 
* @note
*   Il s'agit des objets DOM
*/
function displayedTaskObjects(){
  return DGetAll('div#container-tasks-main div.task-list div.task:not(.hidden)')
}

/**
 * Attente de l'ouverture de l'éditeur de tâche
 * 
* Pour utiliser :
*   waitFor(taskEditorOpened).then(<action>)
* pour attendre que l'éditeur soit ouvert
*/
function taskEditorOpened(){
  return not(DGet('div#task-editor').classList.contains('hidden'))
}
