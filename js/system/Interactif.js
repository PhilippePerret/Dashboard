'use strict';
/**
* Class Interactif
* ----------------
* 
* Pour gérer notamment les méthodes confirm ou prompt
*/
class InteractiveElement {

  static get TopWindow(){ return '200px' }
  static get LeftWindow(){ return 'calc(50% - 250px)'}

  /**
  * @param params {Hash} Les paramètres
  *           params.poursuivre     
  *             Fonction avec laquelle poursuivre (c'est à cette méthode
  *             qu'est transmis le choix de l'utilisateur true/false
  *             en premier argument). 
  *             INUTILE si :poursuivre est défini pour chaque bouton
  *           params.buttonOk {:name, :poursuivre}
  *             Paramètres pour le bouton OK (:name). Si la propriété
  *             :poursuivre est définie, la propriété :poursuivre 
  *             générale n'est pas nécessaire.
  *           params.buttonCancel (:name, :poursuivre, :isDefault)
  *             Idem pour le bouton Cancel
  * 
  */  
  constructor(type, question, params){
    this.type     = type // 'prompt' ou 'confirm'
    this.question = question
    this.params   = this.defaultizeParams(params)
    this.build()
  }
  get isPrompt() { return this.type == 'prompt' }
  onClickOk(e){
    this.hide()

    if ( this.isPrompt ) {
      if ( this.params.buttonOk.poursuivre) {
        this.params.buttonOk.poursuivre.call(null, this.promptField.value)
      } else {
        this.params.poursuivre.call(null, true, this.promptField.value)
      }
    } else {
      if ( this.params.buttonOk.poursuivre ) {
        this.params.buttonOk.poursuivre.call(null)
      } else {
        this.params.poursuivre.call(null, true)
      }
    }
    return stopEvent(e)
  }
  onClickCancel(e){
    this.hide()
    if ( this.params.buttonCancel.poursuivre ) {
      this.params.buttonCancel.poursuivre.call(null)
    } else {
      this.params.poursuivre.call(null, false)
    }
    return stopEvent(e)
  }
  onKeyUp(e){

  }
  onKeyDown(e){
    if (e.key == 'Enter') {
      return this.onClickOk(e)
    } else if ( e.key == 'Escape') {
      return this.onClickCancel(e)
    } else {
      if ( this.isPrompt ) { return true }
      else { return stopEvent(e) }
    }
  }
  
  show(){
    this.obj.classList.remove('hidden')
    if ( this.isPrompt ) {
      this.promptField.focus()
      this.promptField.select()
    }
  }
  hide(){
    this.unobserveKeys()
    this.obj.remove()
  }

  build(){
    const o = DCreate('DIV', {class:'inter-conteneur hidden', style:this.divStyle})
    this.obj = o
    this.msgField   = DCreate('DIV', {class:'inter-message', text: this.question, style:this.msgFieldStyle})
    /*
    |  Le champ pour recevoir une réponse
    */
    if ( this.isPrompt ) {
      this.promptField = DCreate('INPUT', {class:'prompt-field', value: this.params.default, style:this.promptFieldStyle})

    }
    /*
    |  --- Les boutons ---
    */
    const btnsDiv = DCreate('DIV', {style:this.divButtonsStyle})
    const styleDefault = "background-color:#07A518;color:white;"
    /*
    |  Le bouton OK
    */
    const dataBtnOk = {class:'btn-ok', text: this.btnOkName, style:this.btnStyle}
    if ( not(this.params.buttonCancel.isDefault) ) { dataBtnOk.style = styleDefault+this.btnStyle }
    this.btnOk      = DCreate('BUTTON', dataBtnOk)
    /*
    |  Le boutons Cancel
    */
    const dataBtnCancel = {class:'btn-cancel fleft', text: this.btnCancelName, style:this.btnStyle}
    if ( this.params.buttonCancel.isDefault ) { dataBtnCancel.style = styleDefault+this.btnStyle }
    this.btnCancel  = DCreate('BUTTON', dataBtnCancel)
    btnsDiv.appendChild(this.btnOk)
    btnsDiv.appendChild(this.btnCancel)
    
    o.appendChild(this.msgField)
    this.isPrompt && this.msgField.appendChild(this.promptField)
    o.appendChild(btnsDiv)
    document.body.appendChild(o)

    this.observe()
  }
  observe(){
    this.btnOk    .addEventListener('click', this.onClickOk.bind(this))
    this.btnCancel.addEventListener('click', this.onClickCancel.bind(this))      
    this.observeKeys()
  }

  observeKeys(){
    this.oldKeyUpObserver   = window.onkeyup
    this.oldKeyDownObserver = window.onkeydown
    window.onkeyup    = this.onKeyUp.bind(this)
    window.onkeydown  = this.onKeyDown.bind(this)
  }
  unobserveKeys(){
    window.onkeyup    = this.oldKeyUpObserver
    window.onkeydown  = this.oldKeyDownObserver
  }

  get btnOkName(){
    return this.params.buttonOk.name
  }
  get btnCancelName(){
    return this.params.buttonCancel.name
  }

  get divStyle(){
    const top   = this.constructor.TopWindow
    const left  = this.constructor.LeftWindow
    return "background-color:#EFEFEF;user-select:none;position:fixed;z-index:1010;top:"+top+";left:"+left+";width:500px;box-shadow:25px 26px 50px grey;border:1px solid grey;border-radius:0.5em;padding:1.5em;font-size:18pt;font-family:'Arial Narrow', Arial, Helvetica, Geneva;"
  }
  get msgFieldStyle(){
    return 'padding:2em 1em;border:1px solid #CCC;border-radius:0.5em;margin-bottom:2em;font-size:inherit;font-family:inherit;'
  }
  get promptFieldStyle(){
    return 'margin-top:1em;width:80%;font-size:inherit;font-family:inherit;padding:0.2em 0.5em;'
  }
  get divButtonsStyle(){
    return 'text-align:right;'
  }
  get btnStyle(){
    return 'padding:0.5em 1.5em;font-size:16pt;'
  }

  defaultizeParams(params){
    params = params || {}
    params.buttonOk           || Object.assign(params, {buttonOk: {name:'OK'}})
    params.buttonOk.name      || Object.assign(params.buttonOk, {name: 'OK'})
    params.buttonCancel       || Object.assign(params, {buttonCancel: {name:'Cancel'}})
    params.buttonCancel.name  || Object.assign(params.buttonCancel, {name:'Cancel'})
    params.poursuivre || (params.buttonOk.poursuivre && params.buttonCancel.poursuivre) || raise("Il faut absolument définir la fonction pour suivre… (params.poursuivre")
    return params
  }
}

const confirmer = function(question, params){
  new InteractiveElement('confirm', question, params).show()
}
const demander = function(question, defaultResponse, params){
  Object.assign(params, {default: defaultResponse})
  new InteractiveElement('prompt', question, params).show()
}
