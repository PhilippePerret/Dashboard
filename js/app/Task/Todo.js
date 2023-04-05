'use strict';

class Todo extends AbstractTask {

static get ACTION_TYPES(){
  if (undefined == this._actionTypes) {
    this._actionTypes = {
      'run':      "Run à lancer (set-up d'application)", 
      'open':     'Fichier ou dossier à ouvrir', 
      'url':      'URL à rejoindre',
      'url_kpd':  'URL Kindle Direct Publishing (KDP)',
      'open_edi': "Ouvrir dossier dans EDI",
      'rcode':    'Code ruby à évaluer', 
      'bcode':    'Code bash à évalue', 
    }
  } return this._actionTypes
}

/**
* Listes des propriétés d'une tâche Todo
*/
static get PROPERTIES(){
  if (undefined == this._properties){
    this._properties = ['id','resume','cat','start','end', 'duree', 'todo', 'action', 'atype', 'priority']
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
  this.displayAllTask()
  TaskFilter.applyFilter('current')
}
static displayAllTask(){
  this.items.forEach( todo => todo.display('main') )
}


/**
 **   INSTANCE
 **/

constructor(data){
  super(data)
}


}

