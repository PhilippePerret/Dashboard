'use strict';

class TaskEditor {

  static editTask(task){
    this.ready = false
    this.editor.edit(task)
    this.ready = true
  }

  static get editor(){
    return this._editor || (this._editor = new TaskEditor())
  }

  // --- INSTANCE ---

  constructor(){
    this.prepare()
    this.observe()
  }

  edit(task){
    this.task = task
    /*
    |  Mettre ses données dans les champs
    */
    this.setValues()
    /*
    |  Afficher l'éditeur
    */
    this.show()
    /*
    |  Toujours sélectionner la tâche si elle est construite (donc
    |  pas nouvelle)
    */
    task.obj && task.setSelected()
  }

  /**
  * Mettre les valeurs dans les champs
  */
  setValues(){
    this.field('displayed-id').innerHTML = this.task.id
    Task.PROPERTIES.forEach(prop => {
      let value = '';
      if ( this.task.data[prop] ) {
        value = this.task.correct(this.task.data[prop])
      }
      this.field(prop).value = value
    })
    /*
    |  Pour la durée
    */
    if ( this.task.data.duree ) {
      const [nombre, unite] = this.task.data.duree.split(':') 
      this.field('duree-nombre').value  = nombre || 0
      this.field('duree-unite').value   = unite  || ''
    }
  }
  /**
  * Prendre les valeurs des champs
  */
  getValues(){
    let newData = {}
    Task.PROPERTIES.forEach(prop => {
      let value = this.field(prop).value
      value = this.task.uncorrect(value)
      Object.assign(newData, {[prop]: value})
    })
    /*
    |  Pour la durée
    */
    const duree_nombre = Number(this.field('duree-nombre').value) || null
    const duree_unite  = this.field('duree-unite').value || null
    if ( duree_nombre && duree_unite ) {
      newData.duree = `${duree_nombre}:${duree_unite}`  
    }
    /*
    |  On retourne les données
    */
    return newData;
  }

  show(){
    this.setVisibilityTryAction()
    this.activateKeyboardShortcuts()
    this.obj.classList.remove('hidden')
    this.focusOn('resume')
  }
  hide(){
    this.obj.classList.add('hidden')
    this.task = null
    delete this.task
    this.desactivateKeyboardShortcuts()
    TaskEditor.ready = false
  }

  /**
  * Mettre le focus (et tout sélectionner) dans le champ +fieldId+
  * 
  * @note
  *   Si +fieldId+ vaut 'id', l'identifiant du champ est 'task-id'
  */
  focusOn(fieldId){
    const field = this.field(fieldId)
    field.focus()
    field.select()
  }

  /**
  * Pour observer les éléments de l'éditeur
  */
  observe(){
    listen(this.btnSave,'click',this.onClickSave.bind(this))
    listen(this.btnCancel,'click',this.onClickCancel.bind(this))
    listen(this.btnTryAction,'click',this.onTryAction.bind(this))
    listen(this.actionField,'change', this.onChangeAction.bind(this))
    listen(this.field('duree-nombre'),'change',this.onChangeDuree.bind(this))
    listen(this.field('duree-unite'),'change',this.onChangeDuree.bind(this))
  }

  /*
  |  Activation et désactivation des raccourcis clavier pour l'éditeur
  |  de tâches
  */ 
  activateKeyboardShortcuts(){
    this.oldOnKeyPress = window.onkeypress
    this.oldOnKeyUp    = window.onkeyup
    this.oldOnKeyDown  = window.onkeydown
    window.onkeypress = this.onKeyPress.bind(this)
    window.onkeyup    = this.onKeyUp.bind(this)
    window.onkeydown  = this.onKeyDown.bind(this)
  }
  desactivateKeyboardShortcuts(){
    window.onkeypress = this.oldOnKeyPress
    window.onkeyup    = this.oldOnKeyUp
    window.onkeydown  = this.oldOnKeyDown
  }
  onKeyPress(ev){
    return true
    // return stopEvent(ev)
  }
  onKeyUp(ev){
    switch(ev.key){
    case 'Enter':
      return stopEvent(ev)
    case 'Escape':
      return this.onClickCancel(ev)
    default:
      return true
    }
    // - si certains passent pas ici -
    return stopEvent(ev)
  }
  onKeyDown(ev){
    if ( ev.key == 's' && ev.metaKey ){
      stopEvent(ev)
      return this.onClickSave(ev) // enregistrement par cmd-s
    }
    switch(ev.key){
    case 'Enter':
      /**
      * Touche Entrée : en fonction de l'endroit où on se trouve,
      * on accomplit différentes choses.
      */
      return this.treatEnterKey(ev)
    }
    return true
  }

  /**
  * Traitement de la touche Entrée sur tout l'éditeur
  */
  treatEnterKey(ev){
    ev.stopPropagation()
    switch(ev.target.id){
    case 'task-resume':
      this.field('start').focus()
      this.field('start').select()
      break
    case 'task-start':
      this.field('end').focus()
      this.field('end').select()
      break
    case 'task-end':
      this.field('todo').focus()
      this.field('todo').select()
      break
    case 'task-todo': 
      return true
    case 'task-action':
      return true
    }
    // console.info("ev = ", ev)
    return stopEvent(ev)
  }

  prepare(){
    this.peupleCategories()
    this.peupleTypesAction()
    this.peupleDuree()
    $(this.obj).draggable();

  }

  // --- Gestionnaires d'Events ---

  onClickSave(ev){
    const newData = this.getValues()
    if ( this.task.obj ) {
      /*
      |  Tâche existante
      */
      this.task.update(newData)
      
    } else {
      /*
      |  Nouvelle tâche
      */
      this.task.data = this.getValues()
      this.task.constructor.add(this.task)
      this.task.build(null/* pour rechercher où elle doit se mettre */)
      this.task.save()
    }
    this.hide()
    return stopEvent(ev)
  }
  onClickCancel(ev){
    this.hide()
    return stopEvent(ev)
  }

  /**
  * Méthode appelée :
  *   1) lorsqu'on choisit une catégorie
  *   2) lorsqu'on revient après avoir donné le nom d'une nouvelle catégorie
  *       ok est alors true si on veut l'enregistrer
  */
  onChooseCategorie(ev, ok, newCatName){
    const menu = this.field('cat')
    if ( menu.value == '__new__cate__'){
      ok = ok && newCatName && newCatName.length > 0
      if ( ok ) {
        const icate = Categorie.add(new Categorie({name: newCatName, id: Categorie.getNewId()}))
        this.peupleCategories()
        menu.selectedIndex = icate.index + 1
      } else if ( ok === false ) {
        menu.selectedIndex = 0
      } else {
        demander("Nom de la nouvelle catégorie", "Nouvelle catégorie", {poursuivre:this.onChooseCategorie.bind(this,ev)})
      }
    }
    return stopEvent(ev)
  }

  /**
  * Méthode appelée quand on clique sur le bouton pour essai le
  * code (action)
  */
  onTryAction(ev){
    return this.task.onClickRun(ev)
  }

  /**
  * Méthode appelée quand on change la durée de la tâche
  */
  onChangeDuree(ev){
    stopEvent(ev)
    let dureeNombre = Number(this.field('duree-nombre').value)
    let dureeUnite  = this.field('duree-unite').value
    if ( dureeUnite == "" ) { dureeUnite = null }
    /*
    |  Le champ final qui sera lu
    */
    this.field('duree').value = (dureeNombre && dureeUnite) ? `${dureeNombre}:${dureeUnite}` : ""
    /*
    |  Si le nombre est 0 ou qu'il n'y a pas d'unité choisie, on 
    |  n'a rien à changer.
    */
    if ( !dureeNombre || !dureeUnite) return ;
    /*
    |  Sinon, on change la date de fin.
    */
    const start = DateUtils.revdate2date(this.field('start').value)
    const end = start;
    switch(dureeUnite){
    case 'h':
      end.setHours(end.getHours() + dureeNombre)
      break
    case 'd': // jours
      end.setDate(end.getDate() + dureeNombre)
      break
    case 'w': // semaines
      end.setDate(end.getDate() + 7 * dureeNombre)
      break
    case 'm': // mois
      var m = (end.getMonth() + dureeNombre) % 11
      end.setMonth(m)
      break
    }
    // console.log("start / end", start, end)
    this.field('end').value = DateUtils.date2revdate(end)
    return false
  }

  /**
  * Méthode évènement appelée quand on change le code de l'action
  * à jouer
  */
  onChangeAction(ev){
    const actio = this.actionField.value
    this.setVisibilityTryAction(actio)
    const atype = this.field('atype').value
    /*
    |  Les vérifications à faire en fonction du type choisi
    */
    try {
      switch(atype){
      case 'run':
        if ( actio.padStart('run ') ) { throw "Ne pas mettre 'run' au début de la commande, juste l'argument" }
        break;
      }
    } catch(err) {
      erreur(err) 
      this.actionField.focus()
      this.actionField.select()
    }
  }


  // --- Build/Interface Methods ---

  setVisibilityTryAction(action){
    action = action || this.task.data.action
    this.btnTryAction.classList[action ? 'remove' : 'add']('invisible')
  }

  peupleCategories(){
    if ( !Categorie.items ) { Categorie.reset() }
    const mCate = this.field('cat')
    mCate.innerHTML = ''
    mCate.appendChild(DCreate('OPTION',{value:'',text:'Catégorie…'}))
    Categorie.each(cate => mCate.appendChild(DCreate('OPTION',{value:cate.name, text:cate.name})))
    mCate.appendChild(DCreate('OPTION',{value:'__new__cate__',text:'Autre…'}))
    listen(mCate,'change', this.onChooseCategorie.bind(this))
  }

  peupleTypesAction(){
    const mAType = this.field('atype')
    mAType.innerHTML = ""
    for(var atype in Task.ACTION_TYPES) {
      mAType.appendChild(DCreate('OPTION',{value:atype, text:Task.ACTION_TYPES[atype]}))
    }
  }

  peupleDuree(){
    const menu = this.field('duree-nombre')
    menu.innerHTML = ''
    for(var i = 0; i < 20; ++i){
      menu.appendChild(DCreate('OPTION',{value:i, text:String(i)}))
    }
  }


  field(prop){
    return DGet(`#task-${prop}`, this.obj)
  }

  get actionField(){
    return this._actfield || (this._actfield = this.field('action'))
  }
  get btnTryAction(){
    return this._btntryact ||= (this._btntryact = DGet('#btn-try-action', this.obj))
  }
  get btnSave(){
    return this._btnsave || (this._btnsave = DGet('#task-editor-btn-save'))
  }
  get btnCancel(){
    return this._btncancel || (this._btncancel = DGet('#task-editor-btn-cancel'))
  }
  get obj(){return this._obj || (this._obj = DGet('#task-editor'))}
}
