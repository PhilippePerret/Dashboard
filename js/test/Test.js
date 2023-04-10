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
// const TEST_FILES = [
//   'premier_chargement',
//   'task_creation'
//   ]

class Test {

  static get timeout(){return this._timeout || 10 /* secondes */}
  static set timeout(v){this._timeout = v}

  static get mode_test(){return this._modetest}
  static set mode_test(v){
    this._modetest  = true
    WAA.mode_test   = true
  }

  /**
  * Méthode à employer pour jouer les tests
  * 
  * Elle installe aussi tous les tests à jouer
  */
  static run(){
    this.mode_test = true
    if ( 'undefined' === typeof TEST_FILES || TEST_FILES.length == 0 ) {
      WAA.send({class:'WAATest',method:'load_tests'})
    } else {
      this.testList = TEST_FILES
      this.startRun()
    }
  }
  static onLoadTests(retour){
    // console.log("Les tests sont", retour.tests)
    this.testList = retour.tests
    if ( this.testList.length ) {
      this.startRun()
    } else {
      erreur("Aucun test n'est à jouer.")
    }
  }

  static startRun(){
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

  static finDesTest(){
    console.log("%c--- Fin des tests ---",'font-weight:bold;color:#5B5;')
  }

  static loadAndRun(test_name){
    const script = DCreate('SCRIPT', {type:'text/javascript', src:`js/test/tests/${test_name}.js`})
    script.addEventListener('load',this.onRunTest.bind(this, test_name))
    document.head.appendChild(script)
  }

  static onRunTest(test_name, ev){
    console.info("- test %s chargé", test_name)
  }

  static shuffleTestNameList(array){
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array // pour chainage uniquement
  }
}

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
  console.info("%c J'attends %s secondes…", 'color:blue;', nombre_secondes)
  return new Promise((ok,ko) => {setTimeout(ok, nombre_secondes * 1000)})
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
