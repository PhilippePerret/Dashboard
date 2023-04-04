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
    this.selectedTask && this.selectedTask.unsetSelected()
    this._selectedtask = task
  }
  static get selectedTask(){ return this._selectedtask }


  // --- INSTANCE ---

  constructor(data){
    super()
    this.data = data;
  }

  get isCurrent() { return this.start_at < TODAY_END }
  get isFuture()  { return this.start_at > TODAY_END }

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
    this.setVisibilityRunButton()
    isUpdated && this.save()
  }

  set(property, newValue){
    this.data[property] = newValue
    switch(property){
    case 'resume': 
      DGet('.resume',this.obj).innerHTML = newValue
    }
  }

  setSelected(){
    this.obj.classList.add('selected')
    this.isSelected = true
    this.constructor.selectedTask = this
  }
  unsetSelected(){
    this.obj.classList.remove('selected')
    this.isSelected = false
    this.constructor._selectedtask = null
  }

  /*
  |  --- Méthodes d'évènements ---
  */

  onClickTask(ev){
    this.setSelected()
    return stopEvent(ev)
  }

  onClickSpin(ev){
    if ( this.isPinned ) {
      TaskConteneur.Today.appendTask(this)
      this.isPinned = false
    } else {
      TaskConteneur.Pinned.appendTask(this)
      this.isPinned = true
    }
    return stopEvent(ev)
  }
  onClickDone(ev){
    WAA.send({class:'Dashboard::Task',method:'mark_done',data:{task_id: this.id}})
    return stopEvent(ev)
  }
  onMarkDone(res){
    if ( !res.ok ) return erreur(res.msg) 
    try {
      this.isDone = true
      TaskConteneur.Done.appendTask(this)
      this.hideButtons()
    } catch(err) {
      console.error(err)
      erreur("Une erreur est survenue, consulter la console.")
    }
  }

  hideButtons(){this.buttons.classList.add('hidden')}
  showButtons(){this.buttons.classList.remove('hidden')}
  
  onClickEdit(ev){
    TaskEditor.editTask(this)
    return stopEvent(ev)
  }
  onClickRun(ev){
    WAA.send({class:'Dashboard::Task', method:'runTask', data:{task_id: this.id}})
    return stopEvent(ev)
  }
  onRan(retour){
    if (retour.ok) { message("Action jouée avec succès") }
    else { erreur(retour.msg)}
  }
  onClickSup(ev){
    confirmer("Veux-tu vraiment détruire cette tâche ?",{buttonCancel:{isDefault:true}, poursuivre:this.onConfirmSup.bind(this)})
    return stopEvent(ev)
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
        // Pour le moment on ne l'affiche pas
        return
      }
    }
    const conteneur = TaskConteneur.conteneur(ctype)
    const div = DCreate('DIV', {class:'task'})
    this.obj = div
    const resu = DCreate('SPAN', {class:'resume', text: this.resume})
    listen(resu,'dblclick', this.edit.bind(this))
    div.appendChild(resu)
    this.buttons = DCreate('DIV',{class:'buttons'})
    const btnSup = DCreate('DIV',{class:'btn', text:'🗑️', title:`${MGTIT}Détruire définitivement ${this.ref} (sans l'archiver)`})
    listen(btnSup,'click',this.onClickSup.bind(this))
    this.buttons.appendChild(btnSup)
    const btnEdit = DCreate('DIV',{class:'btn', text:'🖌️', title:`${MGTIT}Éditer ${this.ref}`})
    listen(btnEdit,'click',this.onClickEdit.bind(this))
    this.buttons.appendChild(btnEdit)
    const btnDone = DCreate('DIV',{class:'btn', text:'✅', title:`${MGTIT}Marquer ${this.ref} comme accomplie`})
    listen(btnDone,'click',this.onClickDone.bind(this))
    this.buttons.appendChild(btnDone)
    const btnSpin = DCreate('DIV',{class:'btn', text:'📌', title:`${MGTIT}Épingler ${this.ref}`})
    listen(btnSpin,'click',this.onClickSpin.bind(this))
    this.buttons.appendChild(btnSpin)
    this.btnRun = DCreate('DIV', {class:'btn', text:'▶️', title:`${MGTIT}Jouer l'action de cette tâche :\n${this.data.action}`})
    listen(this.btnRun,'click',this.onClickRun.bind(this))
    this.buttons.appendChild(this.btnRun)
    this.setVisibilityRunButton()
    div.appendChild(this.buttons)
    listen(div,'click',this.onClickTask.bind(this))

    conteneur.appendTask(this)
  }

  setVisibilityRunButton(){
    this.btnRun.classList[this.data.action ? 'remove' : 'add']('invisible')
  }


  get id()        { return this.data.id }
  get resume()    { return this.data.resume }
  get categorie() { return this.data.cat }

  get end_at(){
    return this._end_at || (this._end_at = DateUtils.revdate2date(this.data.end))
  }
  get start_at(){
    return this._start_at || (this._start_at = DateUtils.revdate2date(this.data.start))
  }
}
