'use strict';
/**
* Gestion des boutons de tâche
* ----------------------------
* On appelle "boutons de tâche" les boutons en bas des conteneurs
* de tâches qui permettent d'agit sur la tâche sélectionnée, par 
* exemple pour l'éditer, la détruire, la marquer accomplie, etc.
*/
class TaskButton {

  /**
  * Les types de bouton (pour l'action sélectionnée*)
  * *donc sans le 'add'
  */
  static get ButtonTypes() {
    return this._btntypes || ( this._btntypes = ['sup','mod','pin','acc','run','tog','lnk'])
  }
  static prepare(){
    this.observeButtons('main')
  }

  /**
  * Pour régler l'état des boutons après la sélection/désélection
  * d'une tâche
  * 
  * @param [String] ctype   Le type du conteneur ('main','done','pinned')
  */
  static setButtonsState(task, stateON){
    const ctype = task.ctype
    if ( ctype == 'done' ) return // pour le moment
    this.ButtonTypes.forEach(btype => this.button(ctype,btype).setState(stateON))
    this.setVisibilityRunButton(task)
  }

  /**
  * @param [String] ctype Type du container ('main','pinned','done')
  */
  static observeButtons(ctype){
    ctype == 'main' && this.button(ctype,'add').observe()
    this.ButtonTypes.forEach(btype => {
      const button = this.button(ctype,btype)
      /*
      |  On n'observe le bouton que s'il existe
      */
      if ( button.obj ) {
        // console.log("bouton observé : ", button)
        button.observe()
        button.setState(false)
      }
    })
  }

  static setVisibilityRunButton(task){
    const button = this.button(task.ctype,'run')
    button.setVisibility(!!task.data.action)
  }
  setVisibility(visible){
    this.obj.classList[visible ? 'remove' : 'add']('invisible')
  }

  /**
  * @return [TaskButton] l'objet Dom du bouton de type +type+
  * @param [String] cType Le type du container de tâche concerné ('main','pinned', 'done')
  * @param [String] type Le type du bouton, par exemple 'add' ou 'mod'
  */
  static button(cType, type){
    this.buttons || (this.buttons = {})
    this.buttons[cType] || Object.assign(this.buttons, {[cType]: {}})
    this.buttons[cType][type] || Object.assign(this.buttons[cType], {[type]: new TaskButton(cType,type)})
    return this.buttons[cType][type]
  }

  // --- INSTANCE ---

  constructor(conteneurType, buttonType){
    this.conteneur = DGet(`div#container-tasks-${conteneurType}`)
    this.type = buttonType
  }

  /**
  * Pour modifier l'état (enable/disable) du bouton
  */
  setState(state){
    this.obj.disabled = !state
  }

  observe(){
    listen(this.obj,'click', this.onClick.bind(this))
  }

  /**
  * Méthode appelée quand on clique sur un bouton-tâche quelconque de 
  * n'importe quel listing de tâches.
  */
  onClick(ev){
    stopEvent(ev)
    this[`run_${this.type}`].call(this)
    return false
  }

  /*
  |  Toutes les actions sur les tâches
  */
  run_add(){Task.createNew()}
  run_acc(){ this.task.onClickDone    .call(this.task)}
  run_mod(){ this.task.onClickEdit    .call(this.task)}
  run_pin(){ this.task.onClickPin     .call(this.task)}
  run_sup(){ this.task.onClickSup     .call(this.task)}
  run_run(){ this.task.onCLickRun     .call(this.task)}
  run_tog(){ this.task.onClickToggle  .call(this.task)}
  run_lnk(){ this.task.onClickLink    .call(this.task)}

  /**
  * @return [Task] La tâche sélectionnée (courante)
  */
  get task(){
    return Task.selectedTask
  }
  get obj(){
    return this._obj || (this._obj = DGet(`.btn-${this.type}`, this.conteneur))
  }
}
