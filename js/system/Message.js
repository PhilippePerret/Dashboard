'use strict'
/**
 * Class Message
 * --------------
 * Pour l'affichage des messages à l'écran
 * 
 * 
 *    message(str)      Une simple note
 *    erreur(str)       Un message d'erreur
 *    action(str)       Une action en cours
 * 
 * 
 * Pour afficher les messages à un endroit particulier, régler la
 * table MESSAGE_POSITION ci-dessous
 * 
 */

/*
|  Pour le placement du message dans la fenêtre
*/
const MESSAGE_POSITION = { bottom: '40px', left: '10px' }

function say(msg, options){
  options = options || {}
  Object.assign(options, {message: msg})
  WAA.send({class:'Methods',method:'say', data:options})
}

function message(str, options){
  new MessageClass(str, options).showMessage()
  return true
}
function error(err){
  new MessageClass(err).showError()
  return false
}
function erreur(err){return error(err)}

function action(str){
  new MessageClass(str).showAction()
}

function log(...args){
  console.log(...args)
}

class MessageClass {

  constructor(str, options){
    this.content = str
    this.options = options || {}
    this.build()
  }

  init(){
    listen(this.panneauMessage, 'click', this.hideMessage.bind(this))
  }

  showMessage(){ 
    this.showText(this.content, 'notice', this.options) 
  }
  showError(){   
    this.showText(this.content, 'error', this.options) 
  }
  showAction(){
    this.showText(this.content, 'doaction', this.options)
  }

  showText(str,type, options){
    this.panneauMessage.className = `${type} message`
    if ( type !== 'error' && !options.keep ) this.msgTimer = setTimeout(this.hideMessage.bind(this),20*1000)
  }

  hideMessage(){
    this.clearTimerMessage()
    this.panneauMessage.remove()
  }
  clearTimerMessage(){
    if ( this.msgTimer ){
      clearTimeout(this.msgTimer)
      this.msgTimer = null
    }
  }

  /**
   * Construction de la boite qui contiendra tous les messages
   * 
   */
  build(){
    DGet('style#message-styles') || this.grave_balise_styles()

    this.closeBox = DCreate('SPAN', {
        text:'❌'
      , class:'close-btn'
    })
    this.divContent  = DCreate('DIV', {text:this.content,style:'font-family:"Arial Narrow",Geneva,Helvetica;font-size:14pt;'})
    this.constructor.lastId || (this.constructor.lastId = 0)
    this.id = ++this.constructor.lastId
    const o = DCreate('DIV', {
        id:     `message-${this.id}`
      , class:  `message hidden`
      , inner:  [this.divContent, this.closeBox]
    })
    document.body.appendChild(o)
    this._msgpanel = o

    this.observe()
  }

  observe(){
    this.closeBox.addEventListener('click', this.hideMessage.bind(this))
  }

  get panneauMessage(){ return this._msgpanel }

  grave_balise_styles(){
    const script = DCreate('STYLE',{id:'message-styles', type:'text/css', text: this.stylesCSS})
    document.head.appendChild(script)
  }

  leftPosition(){
    return MESSAGE_POSITION.left ? `left:${MESSAGE_POSITION.left};` : ''
  }
  rightPosition(){
    return MESSAGE_POSITION.right ? `right:${MESSAGE_POSITION.right};` : ''
  }
  topPosition(){
    return MESSAGE_POSITION.top ? `top:${MESSAGE_POSITION.top};` : ''
  }
  bottomPosition(){
    return MESSAGE_POSITION.bottom ? `bottom:${MESSAGE_POSITION.bottom};` : ''
  }

  get stylesCSS(){
    return `
div.message {
  position: fixed;
  ${this.leftPosition()};
  ${this.rightPosition()};
  ${this.topPosition()};
  ${this.bottomPosition()};
  color: white;
  width: 400px;
  padding: 8px 12px;
  font-size: 12pt;
  z-index:5000
}
div.message span.close-btn {
  position:absolute;
  right:10px;
  top:10px;
  font-size:10pt;
  cursor:pointer;
}
div.message.error {
  background-color: red;
}
div.message.notice {
  background-color: #38389d;
}
div.message.doaction {
  background-color: orange;
}
    `
  }
}
