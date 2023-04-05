
class TaskConteneur {

  static prepare(){
    this.table = {}
    this.Today  = this.table['main']    = new MainTaskConteneur('main')
    this.Done   = this.table['done']    = new TaskConteneur('done')
    this.Pinned = this.table['pinned']  = new TaskConteneur('pinned')
    this.Pinned.prepare() // notamment le footer
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

  // --- INSTANCE CONTENEUR DE TÂCHE ---
  
  constructor(id){
    this.id = id
  }


  prepare(){
    /*
    |  Si ce n'est pas le conteneur principal ('main'), on lui 
    |  ajoute le footer commun
    */
    if ( this.id != 'main' ) {
      const footer = this.constructor.Today.footer.cloneNode(true)
      this.obj.appendChild(footer)
      DGet('.btn-add',footer).remove()
      TaskButton.observeButtons('pinned')
    }
  }

  appendTask(task){ this.taskList.appendChild(task.obj) }

  get taskList(){return this._tlist || (this._tlist = DGet('.task-list', this.obj)) }

  get footer(){return this._footer || (this._footer = DGet('footer', this.obj))}
  get obj(){return this._obj || (this._obj = DGet(`#container-tasks-${this.id}`))}
}

class MainTaskConteneur extends TaskConteneur {
  constructor(id){super(id)}

}
