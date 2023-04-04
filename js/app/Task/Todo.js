'use strict';

class Todo extends AbstractTask {

/**
* Listes des propriétés d'une tâche Todo
*/
static get PROPERTIES(){
  if (undefined == this._properties){
    this._properties = ['id','resume','start','end', 'todo', 'run', 'priority']
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
  this.items  = []
  this.table  = {}
  this.lastId = 0
  if ( retour.ok ) {
    retour.todos.forEach(dtodo => {
      const item = new Todo(dtodo)
      item.index = this.items.length
      this.items.push(item)
      Object.assign(this.table, {[item.id]: item})
      if ( Number(item.id) > this.lastId ) { this.lastId = Number(item.id) }
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

