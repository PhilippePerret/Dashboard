
class TaskConteneur {

  static prepare(){
    this.table = {}
    this.Today   = this.table['main']    = new MainTaskConteneur('main')
    this.Done    = this.table['done']    = new TaskConteneur('done')
    this.Pinned  = this.table['pinned']  = new TaskConteneur('pinned')
    this.Working = this.table['working'] = new TaskConteneur('working')
    this.Pinned.prepare()   // notamment le footer
    this.Working.prepare()  // idem
    /* - on rend tous les conteneur classables - */
    DGetAll('.task-list').forEach(div => $(div).sortable({axis:'y'}))
  }

  /**
  * Méthode appelée pour déplacer la tâche +task+ du conteneur
  * de type +fromCType+ vers le conteneur de type +toCType+
  * 
  * @note
  *   Cela permet de gérer plus facilement l'état des boutons-tâche
  *   dans le deux conteneurs
  * 
  * @param [Task] task Instance de la tâche à déplacer
  * @param [String] fromCType Type/id du conteneur de départ
  * @param [String] toCType Type/id du conteneur de réception
  */
  static moveTask(task, fromCType, toCType){
    const fromConteneur = this.conteneur(fromCType)
    const toConteneur   = this.conteneur(toCType)
    TaskButton.setButtonsState(task, false)
    toConteneur.appendTask(task)
    TaskButton.setButtonsState(task, true)
  }

  static conteneur(type){
    return this.table[type]
  }

  static get Today()    { return this._conttoday }
  static set Today(v)   { this._conttoday = v }
  static get Done()     { return this._contdone }
  static set Done(v)    { this._contdone = v }
  static get Pinned()   { return this._contpinned }
  static set Pinned(v)  { this._contpinned = v }
  static get Working()  { return this._contworking }
  static set Working(v) { this._contworking = v }

  // --- INSTANCE CONTENEUR DE TÂCHE ---
  
  constructor(id){
    this.id = id
  }

  /**
  * Pour vider le conteneur de son contenu
  */
  flush(){
    this.taskList.innerHTML = ''
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
      TaskButton.observeButtons(this.id)
    }
  }

  /**
  * Ajout de la tâche +task+ à la liste
  * 
  * @note
  *   On passe en revue toutes les tâches pour savoir laquelle est moins prioritaire
  */
  appendTask(task){ 
    const tasks = this.taskList.querySelectorAll('div.task')
    let taskBefore ;
    for (var i = 0, len = tasks.length; i < len; ++i) {
      if ( Number(tasks[i].dataset.priority) < task.priority ) {
        taskBefore = tasks[i]
        break
      }
    }
    this.taskList.insertBefore(task.obj, taskBefore)
    task.ctype = this.id
  }

  get taskList(){return this._tlist || (this._tlist = DGet('.task-list', this.obj)) }

  get footer(){return this._footer || (this._footer = DGet('footer', this.obj))}
  get obj(){return this._obj || (this._obj = DGet(`#container-tasks-${this.id}`))}
}

class MainTaskConteneur extends TaskConteneur {
  constructor(id){super(id)}

}
