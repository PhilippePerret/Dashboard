'use strict';

class Todo extends AbstractTask {


static loadAndDisplayTodayTasks(){
  this.load({date:'today'}).then(ok => {
    if ( ok ) {
      this.displayTodayTasks()
    }
  })
}
static load(filter){
  const my = this
  return new Promise((ok, ko) => {
    my.onOkLoading    = ok
    my.onNotOkLoading = ko
    WAA.send({class:'Dashboard::Task',method:'load',data:{filter:filter}})
  })
}
static onLoad(retour){
  // console.log("retour = ", retour)
  this.items = []
  this.table = {}
  if ( retour.ok ) {
    console.log("todos:", retour.todos)
    retour.todos.forEach(dtodo => {
      const item = new Todo(dtodo)
      this.items.push(item)
      Object.assign(this.table, {[item.id]: item})
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

