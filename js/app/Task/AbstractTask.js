'use strict';
/**
* La class abstraite pour les tâches quelconque
*/
class AbstractTask extends AbstractTableClass {

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
  * Destruction d'une tâche
  */
  static removeTask(task){
    delete this.table[task.id]
    this.items.splice(task.index,1)
    task.obj.remove()
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
  }

  // --- State Methods ---

  get isCurrent()   { return this.start_at < TODAY_END }
  get isFuture()    { return this.start_at > TODAY_END }
  get isOutDated()  { return this.end_at && this.end_at < TODAY_START }
  get endIsNear()   { return DateUtils.dayCountBetween(TODAY_END, this.end_at) < 2 }


  // --- Helpers Methods ---

  get hstart_at(){return DateUtils.date2hdatemin(this.start_at,false) /* false pour court */}
  get hend_at  (){return DateUtils.date2hdatemin(this.end_at  ,false) /* id. */}

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
  *   Si les données ont changé, on enregistre le tâche
  */
  update(newData){
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
    isUpdated && this.save()
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
    if ( this.isDone ){ return 'done' }
    else if (this.isPinned){ return 'pinned' }
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
    return stopEvent(ev)
  }

  onClickPin(){
    if ( this.isPinned ) {
      TaskConteneur.moveTask(this, 'pinned', 'main')
      this.isPinned = false
    } else {
      TaskConteneur.moveTask(this, this.ctype, 'pinned')
      this.isPinned = true
    }
  }
  onClickDone(){
    WAA.send({class:'Dashboard::Task',method:'mark_done',data:{task_id: this.id}})
  }
  onMarkDone(res){
    if ( !res.ok ) return erreur(res.msg) 
    try {
      this.isDone = true
      TaskConteneur.moveTask(this, this.ctype, 'done')
    } catch(err) {
      console.error(err)
      erreur("Une erreur est survenue, consulter la console.")
    }
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
      WAA.send({class:'Dashboard::Task', method:'removeTask', data:{task_id: this.id}})
    } else {
      return
    }
  }
  onRemoved(retour){
    if ( retour.ok ) {
      message("Tâche détruite avec succès.")
      this.constructor.removeTask(this)
    } else {
      erreur(retour.msg)
    }
  }

  get ref(){return `la tâche #${this.id}`}

  /*
  |  --- Display Methods ---
  */

  /**
  * Affichage de la tâche dans le div +ctype+
  */
  display(ctype){
    if ( !ctype ) {
      if ( this.isCurrent ) {
        ctype = 'main'
      } else {
        return
      }
    }
    const conteneur = TaskConteneur.conteneur(ctype)
    const div = DCreate('DIV', {class:'task'})
    this.obj = div
    const resu = DCreate('SPAN', {class:'resume', text: this.correct(this.resume)})

    // - Les dates -
    this.spanStart = DCreate('SPAN',{class:'date start-at', text:this.hstart_at })
    this.spanEnd   = DCreate('SPAN',{class:'date end-at', text:  this.hend_at })

    div.appendChild(this.spanEnd)
    div.appendChild(this.spanStart)
    div.appendChild(resu)
    conteneur.appendTask(this)

    this.checkClassesByStates()

    listen(div,'click',this.onClickTask.bind(this))
    listen(this.obj,'dblclick', this.onDblClick.bind(this))
  }

  get colorClassTask(){
         if ( this.isOutDated ) { return 'outdated' }
    else if ( this.endIsNear  ) { return 'end-near' }
    else if ( this.isFuture   ) { return 'later'    }
    else                        { return 'ok'       }
  }

  // --- Data Methods ---

  get id()        { return this.data.id }
  get resume()    { return this.data.resume }
  get categorie() { return this.data.cat }

  get end_at(){
    return this._end_at || (this._end_at = DateUtils.revdate2date(this.data.end))
  }
  get start_at(){
    return this._start_at || (this._start_at = DateUtils.revdate2date(this.data.start))
  }
  resetDates(){ 
    this._start_at = null
    this._end_at = null
  }
}
