
class TaskConteneur {

  static prepare(){
    this.table = {}
    this.Today  = this.table['main'] = new MainTaskConteneur('main')
    this.Today.observe()
    this.Done   = this.table['done']    = new TaskConteneur('done')
    this.Pinned = this.table['pinned']  = new TaskConteneur('pinned')
    DGetAll('.task-list').forEach(div => $(div).sortable({axis:'y'}))
  }

  static conteneur(type){
    return this.table[type]
  }

  static get Today()  { return this._conttoday }
  static set Today(v) { this._conttoday = v }
  static get Done()   { return this._contdone }
  static set Done(v)  { this._contdone = v }
  static get Pinned() { return this._contpinned }
  static set Pinned(v){ this._contpinned = v }


  constructor(id){
    this.id = id
  }

  appendTask(task){ this.taskList.appendChild(task.obj) }

  get taskList(){return this._tlist || (this._tlist = DGet('.task-list', this.obj)) }
  get obj(){return this._obj || (this._obj = DGet(`#container-tasks-${this.id}`))}
}

class MainTaskConteneur extends TaskConteneur {
  constructor(id){super(id)}

  // --- Gestionnaires d'évènements ---

  /**
  * Méthode appelée quand on clique sur le bouton "+" pour ajouter
  * une tâche.
  */
  onClickAdd(ev){
    Todo.createNew()
    return stopEvent(ev)
  }
  observe(){
    listen(this.btnAdd,'click',this.onClickAdd.bind(this))
  }

  get btnAdd(){return this._btnadd || (this._btnadd = DGet('.btn-add', this.obj) )}
}
