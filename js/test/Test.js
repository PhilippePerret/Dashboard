'use strict';
/**
* Gestion des test
* ----------------
* 
* Dans l'application, pour savoir si on est en mode test, on peut
* indifféremment appeler :
* 
*   WAA.mode_test ou Test.mode_test
* 
* Pour attendre quelque chose dans les tests :
* 
*   waitFor(callback).then(... la vérification ...)
*   wait(x).then(... opération ou vérification ...)
* 
* On peut modifier le timeout avec :
* 
*     Test.timeout = x // nombre de secondes max d'attente
* 
*/
const TEST_FILES = [
    'app/common_tests'
  // , 'app/chargement'
  , 'task/common_tests'
  , 'task/creation'
  , 'task/date_et_temps'
  , 'task/linked'
]
// const TEST_FILES = [
//     "task/date_et_temps"
//   ]

const INTERTIME = 0.2

/**
* @public
* 
* Pour attendre, avant de poursuivre, que la fonction +callback+
* retourne true.
*/
function waitFor(callback){
  return new Waiter(callback).run()
}

/**
* @public
* 
* Pour attendre un certain nombre de secondes
*/
function wait(nombre_secondes){
  nombre_secondes > 1 && console.info("%c J'attends %s secondes…", 'color:blue;', nombre_secondes)
  return new Promise((ok,ko) => {setTimeout(ok, nombre_secondes * 1000)})
}

function action(msg){console.log('%c -> ' + msg,'color:blue;')}
function expect(msg){console.log('%c '+ msg,'color:orange;')}
function notice(msg){console.log('%c ('+ msg +')','color:grey;opacity:0.5;font-style:italic')}
function result(msg){console.log('%c = ' + msg, 'color:green;')}


function next(){Test.next()}
function assert(e,a,m){Test.assert(e,a,m)}
function refute(e,a,m){Test.refute(e,a,m)}
function add_failure(m){Test.add_failure(m)}
function add_success(m){Test.add_success(m)}

function clickOn(domElement){return Test.clickOn(domElement)}


/**
* Pour tester les messages (cf. manuel-test)
*/
class Message {
  /**
  * @public
  */
  static assert_contains(msg){
    assert(true, this.contains(msg), `Le message devrait contenir “${msg}”. Il contient “${this.getContents().join("\n")}”…`)
  }
  /**
  * @public
  */
  static assert_contains_error(msg){
    assert(true, this.contains(msg,'error'), `La page devrait afficher un message d'erreur contenant “${msg}”.`)
  }

  static contains(msg, type){
    const regexp = new RegExp(msg, 'i')
    const contents = this.getContents(type || 'notice')
    // console.log("contents" , contents) // pour afficher "les" contenus
    var istr, len, str;
    for(istr = 0, len = contents.length; istr < len; ++istr){
      if ( regexp.exec(contents[istr]) ) return true
    }
    return false // pas trouvé
  }
  static getContents(type){
    const contents = []
    DGetAll(`div.${type}.message > div`).forEach( div => contents.push(div.innerHTML) )
    return contents
  }
}

class IMessage {

  /**
  * Pour obtenir l'instance IMessage du conteneur de message interactif
  * qui affiche le message +msg+
  * 
  * @return [IMessage] toujours l'instance, même lorsque le message
  * n'a pas été trouvé. Tester <instance>.exists pour savoir s'il existe
  */
  static getWithMessage(msg){
    const regexp = new RegExp(msg, 'i')
    var conteneur = null ;
    DGetAll('div.inter-conteneur').forEach(cont => {
      if ( conteneur ) return ; // pour accélérer
      const divMessage = DGet('div.inter-message', cont)
      if ( regexp.exec(divMessage.innerHTML) ) { conteneur = cont }
    })
    return new IMessage(conteneur, msg)
  }

  constructor(conteneur, message){
    this.conteneur = conteneur
    this.message   = message
  }

  /* @return true si le message interactif existe */
  get exists(){ return !!this.conteneur }
  get errorMsgNotExist(){return `Le message interactif contenant « ${this.message} » n'existe pas.`}

  get btnOK(){
    if ( ! this.exists ) { throw this.errorMsgNotExist }
    return DGet('div .btn-ok', this.conteneur)
  }

  get btnCancel(){
    if ( ! this.exists ) { throw this.errorMsgNotExist }
    return DGet('div .btn-cancel', this.conteneur)
  }

}


class Test {

  /**
  * @public
  * 
  * Pour ajouter un succès
  * 
  */
  static add_success(msg){
    this.success.push({file: this.currentTestFile, msg: msg})
  }

  /**
  * @public
  * 
  * Pour ajouter un échec
  * 
  */
  static add_failure(msg){
    this.failures.push({file: this.currentTestFile, msg: msg})
    console.error('.')
    // console.error(`[%s] %s`, this.currentTestFile, msg)
  }

  /**
  * @public
  * 
  * Test d'égalité (assertion)
  * 
  */
  static assert(expected, actual, err_msg) {
    /*
    |  En javascript, les comparaisons sont difficiles…
    */
    if ( 'object' == typeof expected )  expected = JSON.stringify(expected)
    if ( 'object' == typeof actual )    actual = JSON.stringify(actual)
      
    if ( expected == actual ) {
      this.add_success()
    } else {
      const act = actual   // version raccourcie
      const exp = expected // idem
      err_msg = eval('`' + err_msg + '`')
      this.add_failure(err_msg || `${actual} devrait être égal à ${expected}`)
    }
  }

  /**
  * @public
  * 
  * Test d'inégalité (assertion)
  * 
  */
  static refute(not_expected, actual, err_msg){
    if ( not_expected != actual ) {
      this.add_success()
    } else {
      err_msg = eval('`' + err_msg + '`', this)
      this.add_failure(err_msg || `${actual} ne devrait pas être égal à ${expected}`)
    }
  }

  /**
  * @public
  * 
  * Pour cliquer sur un élément d'interface
  * 
  */
  static clickOn(domElement){
    if ( 'function' == typeof domElement.click ) {
      domElement.click()
    } else {
      console.warn("Je dois apprendre à cliquer sur un élément d'interface qui ne répond pas à click().")
    }
  }

  static get timeout(){return this._timeout || 10 /* secondes */}
  static set timeout(v){this._timeout = v}

  static get mode_test(){return this._modetest}
  static set mode_test(v){
    this._modetest  = true
    WAA.mode_test   = true
  }

  /**
   * @entry
   * 
  * Méthode à employer pour jouer les tests
  * 
  * Elle installe aussi tous les tests à jouer
  */
  static run(retour){
    if ( undefined == retour ) {
      /*
      |  Avant toute chose on indique à l'application qu'on est en
      |  mode test.
      |
      |  @note
      |     On appellera unset_mode_test en fin de test.
      |
      */
      WAA.send({class:'WaaApp::Server',method:'set_mode_test',data:{poursuivre:{class:'Test',method:'run'}}})
    } else {    
      this.mode_test = true
      if ( 'undefined' === typeof TEST_FILES || TEST_FILES.length == 0 ) {
        WAA.send({class:'WAATest',method:'load_tests'})
      } else {
        this.testList = TEST_FILES
        this.testList.includes('required') || this.testList.unshift('required')
        this.preRequired()
      }
    }
  }
  static onLoadTests(retour){
    // console.log("Les tests sont", retour.tests)
    this.testList = retour.tests
    if ( this.testList.length ) {
      this.preRequired()
    } else {
      erreur("Aucun test n'est à jouer.")
    }
  }

  static resetCounts(){
    this.success  = []
    this.failures = []
  }

  /**
  * Si la liste des tests contient 'required', c'est un fichier
  * requis qu'il faut charger avant de lancer les tests.
  */
  static preRequired(){
    if ( this.testList.includes('required') ) {
      /* - on doit supprimer le module required.js - */
      this.testList.splice(this.testList.indexOf('required'),1)
      if ( this.testList.length ) {
        this.loadRequiresModule()
      } else {
        return erreur("Aucun test n'est à jouer.")
      }
    } else {
      this.startRun()
    }
  }

  /**
  * Chargement du module required.js avec de jouer les tests
  */
  static loadRequiresModule(){
    const script = DCreate('SCRIPT', {src:'./js/test/tests/required.js'})
    document.head.appendChild(script)
    listen(script, 'load', this.startRun.bind(this))
  }

  static startRun(){
    this.resetCounts()
    this.tests_count = this.testList.length
    this.test_names = this.shuffleTestNameList(this.testList)
    this.run_next_test()
  }

  static run_next_test(){
    const next_test_name = this.test_names.pop()
    if ( next_test_name ) {    
      console.info("- Chargement de '%s'", next_test_name)
      this.loadAndRun(next_test_name)
    } else {
      this.finDesTest()
    }
  }
  static next(){
    this.run_next_test()
  }

  /**
  * Rapport final
  * ------------
  */
  static finDesTest(){
    const nb_success  = this.success.length
    const nb_failures = this.failures.length
    const nb_tests    = this.tests_count
    const color = nb_failures ? '#C55' : '#5B5'

    console.log('%c-------------- FIN DES TESTS -------------',`font-weight:bold;color:${color};`)
    if ( nb_failures ) {
      /*
      |  On reprend les messages d'erreur
      */
      this.failures.forEach(failure => {
        console.error(failure.msg)
      })
    }
    const msg = `%c------------------------------------------\nSuccès : ${nb_success} - échecs : ${nb_failures} (nombre fichiers de tests : ${nb_tests})` 
    console.log(msg,`font-weight:bold;color:${color};`)
    /*
    |  Un message final pour l'utilisateur
    */
    if ( nb_failures ) {
      erreur("Des erreurs ont été rencontrées (afficher la console développement pour les voir — Cmd+Alt+i).")
    } else {
      message("Tous les tests ont été joués avec succès.")
    }
      WAA.send({class:'WaaApp::Server',method:'unset_mode_test',data:{}})
  }

  static loadAndRun(test_name){
    this.currentTestFile = test_name // pour les messages
    const script = DCreate('SCRIPT', {type:'text/javascript', src:`js/test/tests/${test_name}.js`})
    script.addEventListener('load',this.onRunTest.bind(this, test_name))
    document.head.appendChild(script)
  }

  static onRunTest(test_name, ev){
    // En fait, quand on arrive là, tout le code a déjà été 
    // joué.
  }

  static shuffleTestNameList(array){
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array // pour chainage uniquement
  }
}



class Waiter {
  constructor(callback){
    this.callback = callback
  }
  get maxTimeout(){ return this._maxtimeout || Test.timeout }
  set maxTimeout(v){ this._maxtimeout = v}

  run(){
    this.startTime = new Date()
    this.maxEndTime = new Date().setSeconds(this.startTime.getSeconds() + this.maxTimeout)
    return new Promise((ok,ko) => {
      this.ok = ok
      this.ko = ko
      this.loop()
    })
  }
  loop(){
    this.timerWaitFor = setTimeout(this.checkWait.bind(this), 500)    
  }

  checkWait(callback){
    clearTimeout(this.timerWaitFor)
    delete this.timerWaitFor
    if ( this.callback.call() ) {
      this.ok()
    } else if (this.maxEndTime < new Date()) {
      this.ko("Timeout sur l'attente")
    } else {
      this.loop()
    }
  }

}
