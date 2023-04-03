'use strict';
/**
* La class abstraite pour les tâches quelconque
*/
class AbstractTask {

  static get(task_id){
    return this.table[task_id]
  }

  static get containerTasksToday(){
    return this._conttoday || (this._conttoday = DGet(`#container-tasks-main`))
  }
  static get containerTasksDone(){
    return this._contdone || (this._contdone = DGet(`#container-tasks-done`))
  }
  static get containerTasksPinned(){
    return this._contpinned || (this._contpinned = DGet(`#container-tasks-pinned`))
  }

  // --- INSTANCE ---

  constructor(data){
    this.data = data;
  }

  /*
  |  --- Méthodes d'évènements ---
  */
  onClickSpin(ev){
    if ( this.isPinned ) {
      this.constructor.containerTasksToday.appendChild(this.obj)
      this.isPinned = false
    } else {
      this.constructor.containerTasksPinned.appendChild(this.obj)
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
      this.constructor.containerTasksDone.appendChild(this.obj)
      this.buttons.classList.add('hidden')
    } catch(err) {
      console.error(err)
      erreur("Une erreur est survenue, consulter la console.")
    }
  }
  onClickEdit(ev){
    TaskEditor.editTask(this)
    return stopEvent(ev)
  }
  onClickSup(ev){
    confirmer("Veux-tu vraiment détruire cette tâche ?",{buttonCancel:{isDefault:true}, poursuivre:this.onConfirmSup.bind(this)})
    return stopEvent(ev)
  }
  // - après confirmation de la destruction -
  onConfirmSup(dontDoIt){
    if ( dontDoIt ) {
      return
    } else {
      message("Je dois apprendre à supprimer la tâche")
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

    const conteneur = ((containerType) => {
      switch(containerType){
      case 'main': return this.constructor.containerTasksToday;
      case 'done': return this.constructor.containerTasksDone;
      }
    })(ctype);
    const div = DCreate('DIV', {class:'task', text: this.resume})
    this.obj = div
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

    div.appendChild(this.buttons)
    conteneur.appendChild(div)
  }


  get resume(){return this.data.resume}
  get id(){return this.data.id}

  get end_at(){
    return this._end_at || (this._end_at = DateUtils.revdate2date(this.data.end))
  }
  get start_at(){
    return this._start_at || (this._start_at = DateUtils.revdate2date(this.data.start))
  }
}
