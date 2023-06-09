'use strict';
/**
* La class abstraite pour les tâches quelconque
*/
class Task extends AbstractTableClass {

  static get ACTION_TYPES(){
    if (undefined == this._actionTypes) {
      this._actionTypes = {
        'run':      "Run à lancer (set-up d'application)", 
        'open':     'Fichier ou dossier à ouvrir', 
        'url':      'URL à rejoindre',
        'url_kpd':  'URL Kindle Direct Publishing (KDP)',
        'open_edi': "Ouvrir dossier dans EDI",
        'rcode':    'Code ruby à évaluer', 
        'bcode':    'Code bash à évaluer', 
      }
    } return this._actionTypes
  }

  /**
  * Listes des propriétés d'une tâche Task
  */
  static get PROPERTIES(){
    if (undefined == this._properties){
      this._properties = ['id','resume','cat','start','end', 'duree', 'todo', 'action', 'atype', 'priority','prev']
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
    this.reset()
    Categorie.reset()
    if ( retour.ok ) {
      /*
      |  Instanciation de toutes les tâches
      |
      |  On passe ici lorsque le chargement des tâches s'est bien
      |  passé et qu'on doit les instancier.
      |  On en profite aussi pour régler la propriété nextTasks des
      |  tâches liées.
      |
      */
      retour.todos.forEach(dtodo => {
        const item = this.add(new Task(dtodo))
        Categorie.addTask(item)
      })
      /*
      |  Traitement des liaisons (réglage de la propriété nextTasks)
      */
      this.each( task => {
        task.isLinked = !!task.prev && task.prev.length
        task.isLinked && task.prevTasks.forEach(prev => prev.addNext(task))
      })
      this.onOkLoading(true)
    } else {
      this.onNotOkLoading()
      erreur(retour.msg)
    }
  }

  static reset(){
    super.reset()
    TaskConteneur.Today.flush()
    TaskConteneur.Done.flush()
    TaskConteneur.Pinned.flush()
    TaskConteneur.Working.flush()
  }

  static displayTodayTasks(){
    this.displayAllTask()
    TaskFilter.applyFilter('current')
    // On indique que l'application est prête
    App.isReady = true
  }

  static displayAllTask(){
    this.items.forEach( tk => tk.build() )
  }

  /**
  * Méthode appelée pour créer une nouvelle tâche
  */
  static createNew(){
    const data = { 
      id:     this.getNewId(),
      resume: `Résumé de la tâche #${this.lastId}`,
      start:  DateUtils.today.asRevdate(),
      end:    DateUtils.afterTomorrow.asRevdate(),
      todo:   "- première sous-tâche\n- deuxième sous-tâche\n- 3e sous-tâche",
    }
    const newTask = new this(data)
    newTask.edit()
  }

  /**
  * Destruction d'une tâche (dans la classe seulement)
  */
  static removeTask(task){
    super.remove(task)
  }

  static set selectedTask(task){
    if ( task == this.selectedTask ) return
    this.selectedTask && this.selectedTask.unsetSelected()
    this._selectedtask = task
    TaskFilter.enableOptionsWithSelected()
    TaskButton.setButtonsState(task, true)
  }
  static get selectedTask(){ return this._selectedtask }
  
  static unselectTask(){
    if (this.selectedTask) {
      TaskButton.setButtonsState(this.selectedTask, false)
      this.selectedTask.unmarkSelected()
    }
    TaskFilter.disableOptionsWithSelected()
    this._selectedtask = null
  }


  // --- INSTANCE ---

  constructor(data){
    super()
    this.data = data;
    this.isFolded = true
    this._masked = false
    this._pinned  = data.pinned === true
    this._working = data.working === true
  }

  // --- State Methods ---

  get isCurrent()     { return !this.isLinked && this.start && this.start_at < TODAY_END }
  get isFuture()      { return this.start && this.start_at > TODAY_END }
  get isOutDated()    { return this.end_at && this.end_at < TODAY_START }
  get isMasked()      { return this._masked == true   }
  get isPinned()      { return this._pinned == true   }
  get isWorking()     { return this._working == true  }
  get endIsNear()     { return this.end_at && DateUtils.dayCountBetween(TODAY_END, this.end_at) < 2 }
  get hasNoDeadline() { return !this.start && !this.end }


  // --- Helpers Methods ---

  get hstart_at(){return this.start ? DateUtils.date2hdatemin(this.start_at,false) /* false pour court */ : '---'}
  get hend_at  (){return this.end   ? DateUtils.date2hdatemin(this.end_at  ,false) /* id. */ : '---'}

  // --- Fonctional Methods ---

  /**
  * Pour enregistrer la tâche
  */
  save(){
    WAA.send({class:'Dashboard::Task',method:'saveTask',data:{task_data:this.data}})
  }
  onSaved(retour){
    if (retour.ok){
      message(`Tâche #${this.id} enregistrée avec succès.`)
    } else {
      erreur(retour.msg)
    }
  }

  show(){this.obj.classList.remove('hidden')}
  hide(){this.obj.classList.add('hidden')}

  /**
  * Pour éditer la tâche
  */
  edit(){
    return TaskEditor.editTask(this)
  }

  /**
  * Pour actualiser les données de la tâche
  * 
  * @note
  *   Si les données ont changé, on enregistre la tâche
  * 
  * @param [Boolean] forcer Si true, on actualise toujours, même
  *                  si les données n'ont pas changé.
  */
  update(newData, forcer){
    var isUpdated = false
    for(var prop in newData){
      if ( newData[prop] != this.data[prop] ) {
        this.set(prop, newData[prop])
        isUpdated = true
      }
    }
    this.resetDates()
    this.checkClassesByStates()
    TaskButton.setVisibilityRunButton(this)
    if ( isUpdated || forcer === true) {
      this.setLinkState(this.prev && this.prev.length > 0)
      TaskFilter.applyCurrentFilter()
      this.save()
      this.isFolded || this.buildItsTasksAsSubTasks()
    }
  }


  /**
  * Méthode chargée de vérifier les styles (tâche et dates) en 
  * fonction du statut de la tâche (dépassée, future, etc.)
  */
  checkClassesByStates(){
    // - Classe générale de la tâche -
    this.obj.classList[this.isOutDated?'add':'remove']('outdated')
    // - Classe/aspect des dates
    this.spanStart.className = 'date start-at ' + this.colorClassTask
    this.spanStart.innerHTML = this.hstart_at
    this.spanEnd.className = 'date end-at ' + this.colorClassTask
    this.spanEnd.innerHTML = this.hend_at
  }

  // @return [String] le type actuel du conteneur
  get conteneurType(){
    if      (this.isDone   ) { return 'done'    }
    else if (this.isWorking) { return 'working' }
    else if (this.isPinned ) { return 'pinned'  }
    else return 'main'
  }
  // Raccourci
  get ctype(){
    return this._ctype || this.conteneurType
  }
  set ctype(v){this._ctype = v}

  set(property, newValue){
    this.data[property] = newValue
    switch(property){
    case 'resume': 
      DGet('.resume',this.obj).innerHTML = this.correct(newValue)
    }
  }

  // --- Link Methods ---

  /**
  * Réglage de l'état de liaison de la tâche
  * 
  * ATTENTION : il y a deux cas :
  *   1.  c'est la première. Dans ce cas isLinked n'est pas mis à 
  *       true (pour qu'elle soit affichée)
  *   2.  Ce n'est pas la première. Dans ce cas, isLinked est mis à
  *       true, ce qui empêchera son affichage dans les tâches 
  *       courante.
  */
  setLinkState(linked){
    if ( undefined === linked) {
      linked = (this.prev && this.prev.length)
    }
    if ( this.data.prev ) {
      this.isLinked = linked
    }
    this.obj && this.obj.classList[linked?'add':'remove']('linked')
  }

  /**
  * @sync
  * 
  * Méthode appelée quand on marque la tâche faite ou qu'on la 
  * détruit, qui démarre les tâches suivantes (sauf si ces suivantes
  * dépendent d'autres tâches non achevées)
  * 
  * @note
  *   Puisque cette tâche va être détruite ou marquée faite, on 
  *   lui colle une nouvelle propriété, @next, qui contiendra ses
  *   tâches suivantes (ça ne sert pas vraiment pour le moment, mais
  *   peut-être que ça pourra servir si on invente un système d'annu-
  *   lation)
  */
  onMarkDoneOrDelete(){
    const linker = new TaskLinker(this)
    const nexts  = []
    this.nextTasks.forEach(task => {
      linker.unlinkWithNext(task)
      nexts.push(task.id)
    })
    this.data.next = nexts
  } 


  /*
  |  Pour que toutes les valeurs passent du serveur au client, il
  |  faut remplacer certains caractères
  */
  correct(str){
    if ("string" == typeof str) {
      str = str.replace(/__GUIL__/g,'"')
    }
    return str
  }
  uncorrect(str){
    if ("string" == typeof str) {
      str = str.replace(/"/g,'__GUIL__')
    }
    return str
  }

  setSelected(){
    this.obj.classList.add('selected')
    this.isSelected = true
    this.constructor.selectedTask = this
  }
  unsetSelected(){
    this.unmarkSelected()
    this.constructor.unselectTask()
  }
  unmarkSelected(){
    this.obj.classList.remove('selected')
    this.isSelected = false
  }

  /*
  |  --- Méthodes d'évènements ---
  */

  onDblClick(ev){
    stopEvent(ev)
    this.edit()
    return false
  }

  onClickTask(ev){
    this.setSelected()
    // return stopEvent(ev) // non, si ça bloque tout clique à l'intérieur
  }

  onClickToggle(ev){
    if ( this.isFolded ) {
      this.unfold()
    } else {
      this.fold()
    }
    this.isFolded = !this.isFolded
    return ev && stopEvent(ev)
  }

  /**
  * Méthode appelée quand on veut masquer la tâche provisoirement
  * (pour cette sessions)
  * 
  */
  onClickMask(ev){
    if ( this.isMasked ) {
      this.show()
    } else {
      Task.unselectTask()
      this.hide()
    }
    this._masked = !this._masked
    return ev && stopEvent(ev)
  }
  /**
  * Méthode appelée pour lier/délier une tâche à une autre
  * (la tâche sélectionnée doit suivre celle qui sera choisie ici)
  */
  onClickLink(ev){
    new TaskLinker(this).treatLinking()
  }

  /**
  * Méthode appelée quand on clique sur la case à cocher d'une sous-
  * tâche (en mode déplié de la tâche). On reconstruit la propriété
  * :todo de la tâche
  */
  onClickSubtask(cb, ev){
    // console.log("click sur ", cb)
    this.debuildSubtasksAsTasks()
    ev && stopEvent(ev)
    return true
  }

  onClickPin(){
    if ( this.isPinned ) {
      TaskConteneur.moveTask(this, 'pinned', 'main')
    } else {
      TaskConteneur.moveTask(this, this.ctype, 'pinned')
    }
    this.data.pinned = this._pinned = !this.data.pinned
    this.save()
  }

  /**
  * Quand on clique le bouton pour marquer la tâche comme accomplie
  */
  onClickDone(){
    WAA.send({class:'Dashboard::Task',method:'mark_done',data:{task_id: this.id}})
  }
  onMarkDone(res){
    if ( !res.ok ) return erreur(res.msg) 
    try {
      this.isDone = true
      TaskConteneur.moveTask(this, this.ctype, 'done')
      /*
      |  Si la tâche est liée à une suivante, il faut activer la suivante
      */
      this.nextTasks.length && this.onMarkDoneOrDelete()
    } catch(err) {
      console.error(err)
      erreur("Une erreur est survenue, consulter la console.")
    }
  }

  /**
  * Quand on clique sur le bouton pour indiquer que la tâche doit
  * être un travail en cours (ou ne plus l'être)
  */
  onClickWorking(){
    if ( this.isWorking ) {
      TaskConteneur.moveTask(this, 'working', 'main')
    } else {
      TaskConteneur.moveTask(this, this.ctype, 'working')
    }
    this.data.working = this._working = !this.data.working
    this.save()
  }
  
  onClickEdit(){
    TaskEditor.editTask(this)
  }
  onClickRun(){
    WAA.send({class:'Dashboard::Task', method:'runTask', data:{task_id: this.id}})
  }
  onRan(retour){
    if (retour.ok) { message("Action jouée avec succès") }
    else { erreur(retour.msg)}
  }
  onClickSup(){
    confirmer("Veux-tu vraiment détruire cette tâche ?",{buttonCancel:{isDefault:true}, poursuivre:this.onConfirmSup.bind(this)})
  }
  // - après confirmation de la destruction -
  onConfirmSup(doIt){
    if ( doIt ) {
      // On commence par supprimer le fichier
      WAA.send({class:'Dashboard::Task', method:'removeTask', data:{task_id: this.id}})
    } else {
      return
    }
  }
  static afterTaskRemoved(retour){
    if ( retour.ok ) {
      /*
      |  Quand la destruction du fichier a bien pu se faire
      */
      const task = this.get(retour.taskId) // Elle DOIT encore exister
      /*
      |  On marque qu'elle est en cours de destruction pour que les
      |  autres le sache
      */
      task.beingDeleted = true
      /*
      |  On détruit son objet DOM
      */
      task.obj.remove()
      /*
      |  Si la tâche est liée à une suivante, il faut activer la suivante
      */
      task.nextTasks.length && task.onMarkDoneOrDelete()
      /*
      |  Si la tâche est liée à une précédente, il faut la retirer des 
      |  next de la précédente
      */
      // TODO
      /*
      |  Détruire vraiment la tâche (dans la classe (liste, etc.))
      */
      this.removeTask(task)
      message("Tâche détruite avec succès.")
    } else {
      erreur(retour.msg)
    }
  }

  get ref(){return `la tâche #${this.id}`}


  /*
  |  --- Display Methods ---
  */

  /**
  * Construction de la tâche dans le div +ctype+
  * 
  */
  build(){
    const ctype = this.ctype
    if ( !ctype ) return
    /*
    |  Le conteneur de la tâche
    */
    const conteneur = TaskConteneur.conteneur(ctype)
    const div = DCreate('DIV', {id: `task-${this.id}`, class:'task unfold'})
    this.obj = div
    this.obj.dataset.priority = this.priority

    // - Le résumé -
    const resu = DCreate('SPAN', {class:'resume', text: this.correct(this.resume)})
    // - Bouton pour déplié/replié
    this.btnFold = DCreate('SPAN', {class:'btn-fold', text:'▷'})
    listen(this.btnFold,'click', this.onClickToggle.bind(this))

    // - Les dates -
    this.spanStart = DCreate('SPAN',{class:'date start-at', text:this.hstart_at })
    this.spanEnd   = DCreate('SPAN',{class:'date end-at', text:  this.hend_at })

    // - Le bloc des actions (et ses boutons) -
    this.blockActions = DCreate('DIV', {class:'block-actions'})

    // - Le bloc de sous-tâches (et ses boutons) -
    this.blocSubtasks = DCreate('DIV',{class:'bloc-subtasks'})
    // - Les sous-tâches en mode ouvert -
    const sub = DCreate('DIV', {class:'subtasks'})
    this.divSubtasks = sub
    // - Boutons pour bloc sous-tâche -
    this.btnsSubtasks = DCreate('DIV', {class:'btns-subtasks'})
    const spanCb = DCreate('INPUT',{type:'checkbox', label:'Supprimer les sous-tâches quand on les marque faites', checked:false, class:'cb-sup-subtasks-done'})
    this.cbSupSubtasks = DGet('input[type="checkbox"]', spanCb)
    this.btnsSubtasks.appendChild(spanCb)
    
    this.blocSubtasks.appendChild(this.divSubtasks)
    this.blocSubtasks.appendChild(this.btnsSubtasks)

    div.appendChild(this.spanEnd)
    div.appendChild(this.spanStart)
    div.appendChild(this.btnFold)
    div.appendChild(resu)
    div.appendChild(this.blocSubtasks)
    div.appendChild(this.blockActions)
    conteneur.appendTask(this)

    this.checkClassesByStates()
    this.setLinkState(!!this.prev)

    // listen(resu,'click',this.onClickTask.bind(this))
    listen(this.obj,'click',this.onClickTask.bind(this))
    listen(this.obj,'dblclick', this.onDblClick.bind(this))
  }


  /*
  |  Pour déplier/replier la tâche
  */
  fold(){
    this.obj.classList.toggle('unfolded')
    this.btnFold.innerHTML = '▷'
  }
  unfold(){
    this.buildItsTasksAsSubTasks()
    this.buildItsActionsAsSubActionst()
    this.obj.classList.toggle('unfolded')
    this.btnFold.innerHTML = '▽'
  }

  /**
  * Méthode qui affiche les actions de la tâche quand on la déplie,
  * si elle en a.
  */
  buildItsActionsAsSubActionst(){
    this.blockActions.innerHTML = ''
    if ( this.data.action ) {
      this.blockActions.innerHTML = `ACTION ${Task.ACTION_TYPES[this.data.atype]} : ${this.data.action}`
      this.blockActions.classList.remove('empty')
    } else {
      this.blockActions.classList.add('empty')
    }
  }
  /**
  * 
  * Méthode de construction qui transforme la propriété 'todos' de
  * la tâche en liste de sous-tâches (c'est-à-dire que toutes les
  * lignes commençant par "-" sont transformées en sous tâche à
  * cocher) 
  * 
  * @note
  *   La méthode est appelée quand on veut déplier la tâche
  */
  buildItsTasksAsSubTasks(){
    // console.info("(re)Construction de la liste des sous-tâches")
    this.lastIdSubtask = 0
    this.divSubtasks.innerHTML = ""
    var hasSubtasks = false 
    String(this.data.todo).split("\n").forEach(line => {
      line = this.correct(line.trim())
      if ( line.startsWith('- ') ) {
        this.divSubtasks.appendChild(this.buildSubtask(line))
        hasSubtasks = true
      } else if (line.startsWith('x ')) {
        this.divSubtasks.appendChild(this.buildSubtask(line, true))
        hasSubtasks = true
      } else {
        this.divSubtasks.appendChild(DCreate('DIV',{text:line, class:'plain'}))
      }
    })
    /*
    |  On règle la visibilité de la case à cocher "Supprimer les 
    |  sous-tâches quand elles sont faites" suivant le fait qu'il y a
    |  des sous-tâches ou non
    */
    this.toggleSubtasksButtons(hasSubtasks)
  }

  /**
  * Pour masque ou afficher les boutons pour les sous-tâches en 
  * fonction du fait qu'il y en a ou non.
  */
  toggleSubtasksButtons(hasSubtasks){
    this.btnsSubtasks.classList[hasSubtasks?'remove':'add']('hidden')
  }


  /**
  * Méthode inverse de la précédente, qui prend l'état déplié pour
  * composer le texte de la propriété :todo (les tâches cochées sont
  * remplacées par "x ma tâche" et celles qui ne sont pas encore 
  * faites sont laissées à "- ma tâche")
  * SAUF si la case à cocher de suppression des sous-tâches faites
  * est cochée, dans ce cas, on détruit la sous-tâche.
  */
  debuildSubtasksAsTasks(){
    const str = []
    const deleteSubtaskDone = this.cbSupSubtasks.checked
    DGetAll('div.subtasks > div', this.obj).forEach(div => {
      if ( div.classList.contains('plain') ) {
        /*
        |  Une ligne "normale"
        */
        str.push(this.uncorrect(div.innerHTML.trim()))
      } else {
        /*
        |  Une sous-tâche
        */
        var cb = DGet('input', div)
        if ( cb.checked && deleteSubtaskDone ) { return /* supprime la tâche */ }
        var prefix  = cb.checked ? 'x ' : '- '
        var content = this.uncorrect(prefix + DGet('label', div).innerHTML.trim())
        str.push(content)
      }
    })
    this.update({todo: str.join("\n")})
  }

  buildSubtask(str, checked){
    const subtaskId = ++ this.lastIdSubtask
    str = str.substr(1, str.length)
    const cont  = DCreate('DIV',{class:'subtask', id: `subtask-${subtaskId}`})
    const cb    = DCreate('INPUT',{type:'checkbox', id:`subtask-${subtaskId}-cb`})
    listen(cb, 'change', this.onClickSubtask.bind(this, cb))
    cont.appendChild(cb)
    cb.checked = !!checked
    cont.appendChild(DCreate('LABEL',{text:str, for:`subtask-${subtaskId}-cb`}))
    return cont
  }

  get colorClassTask(){
         if ( this.isOutDated ) { return 'outdated' }
    else if ( this.endIsNear  ) { return 'end-near' }
    else if ( this.isFuture   ) { return 'later'    }
    else                        { return 'ok'       }
  }

  // --- Volatile Data ---

  get prevTasks() { 
    if ( undefined === this._prevtasks ) {
      if ( this.prev ) {
        this._prevtasks = []
        this.prev.forEach(tkid => {
          const tk = Task.get(tkid) // elle peut ne plus exister
          tk && this._prevtasks.push(tk)
        })
      } else {
        this._prevtasks = []
      }
    }
    return this._prevtasks
  }
  set prevTasks(tasks) {
    this._prevtasks = tasks
    this.data.prev = tasks.map(task => {return task.id})
  }
  /**
  * Pour supprimer la tâche précédente +task+
  */
  removePrev(task){
    const idx = this.prev.indexOf(task.id)
    if ( idx > -1 ) {
      this.prev.splice(idx,1)
      delete this._prevtasks // pour forcer l'actualisation
    } else {
      console.warn(`La tâche #${this.id} ne possède pas de tâche précédente #${task.id}. Je ne peux pas les délier.`)
    }
  }

  /**
  * La tâche suivante, si elle existe (est-ce que c'est utile ?)
  * (en tout cas, si c'est utile, il faut définir cette donnée au
  * chargement de toutes les tâches)
  */
  get nextTasks(){
    return this._nexttasks || []
  }
  /**
  * Méthodes qui lie/délie la tâche présente de la tâche suivante +task+
  */
  addNext(task){
    const nexts = this.nextTasks || []
    nexts.push(task)
    this.setLinkState(true)
    this._nexttasks = nexts
  }
  /**
  * Pour supprimer la tâche suivante +task+
  */
  removeNext(task){
    const newNexts = []
    this.nextTasks.forEach( tk => {
      if ( tk.id == task.id ){return} else {newNexts.push(tk)}
    })
    this.setLinkState(!!newNexts.length)
    this._nexttasks = newNexts
  }

  // --- Data Methods ---

  get id()        { return this.data.id       }
  get start()     { return this.data.start    }
  get end()       { return this.data.end      }
  get prev()      { return this.data.prev     }
  set prev(v)     { this.data.prev = v ; delete this._prevtasks }
  get resume()    { return this.data.resume   }
  get categorie() { return this.data.cat      }
  get priority()  { return parseInt((this.data.priority||0),10) }

  get end_at(){
    return this._end_at || (this._end_at = this.end && DateUtils.revdate2date(this.end))
  }
  get start_at(){
    return this._start_at || (this._start_at = this.start && DateUtils.revdate2date(this.start))
  }
  resetDates(){ 
    this._start_at = null
    this._end_at = null
  }
}
