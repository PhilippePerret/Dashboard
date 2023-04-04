'use strict';

class Todo extends AbstractTask {

static get ACTION_TYPES(){
  if (undefined == this._actionTypes) {
    this._actionTypes = ['Code à évaluer', 'Fichier à ouvrir', 'Dossier à ouvrir']
  } return this._actionTypes
}

/**
* Listes des propriétés d'une tâche Todo
*/
static get PROPERTIES(){
  if (undefined == this._properties){
    this._properties = ['id','resume','cat','start','end', 'todo', 'action', 'atype', 'priority']
  } return this._properties
}

static loadAndDisplayAllTasks(){
  this.loadAll().then( ok => ok && this.displayTodayTasks() )
}
static loadAll(){
  const my = this
  return new Promise((ok, ko) => {
    my.onOkLoading    = ok
    my.onNotOkLoading = ko
    WAA.send({class:'Dashboard::Task',method:'load',data:{}})
  })
}
static onLoad(retour){
  // console.log("retour = ", retour)
  this.reset()
  Categorie.reset()
  if ( retour.ok ) {
    retour.todos.forEach(dtodo => {
      const item = this.add(new Todo(dtodo))
      Categorie.addTask(item)
    })
    this.onOkLoading(true)
  } else {
    this.onNotOkLoading()
    erreur(retour.msg)
  }
}

static displayTodayTasks(){
  this.items.forEach(todo => {
    if ( todo.start_at < TODAY_END) {
      todo.display('main')
    }
  })
}


/**
 **   INSTANCE
 **/

constructor(data){
  super(data)
}


}

