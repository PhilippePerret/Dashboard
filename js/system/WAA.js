'use strict';
/**

  WAA.js
  ------
  version 3.2
  
  Librairie permettant de gérer la WAA application. De façon simple,
  elle reçoit et elle transmet les données au script (ruby) qui a
  lancé l'application avec le web-driver Selenium, appelé ci-dessus
  le "script maitre"

  WAA.state = 1   au démarrage
  WAA.state = 2   quand l'application est prête

  @usage
  ------

    Pour envoyer un message au serveur :

      WAA.send({
          class:'LeModule::LaClasse'
        , method:'la_method'
        , data:{... les données ...}
      })

    LeModule::LaClasse#la_method doit être une méthode ruby qui
    reçoit un seul argument : les données +data+

  @test

    Pour passer en mode test, il faut utiliser :

      WAA.mode_test = true

    Cela envoie chaque fois la donnée mode_test = true au serveur
    qui peut alors gérer les choses en conséquence.

*/
class Waa {

  /**
   * Méthode appelée par le serveur (script maitre) pour savoir 
   * s'il y a des 'messages' à recevoir. Si c'est le cas, on le
   * retourne.
   * 
   * Note-rappel : un 'Message' est un échange entre serveur et 
   * client qui a toujours la même forme. Dans la première version
   * de WAA, il contient :classe (définition d'une classe à appeler),
   * :method (la méthode de la classe à appeler) et :data (optionnel-
   * lement, les données, une table, à passer à la méthode).
   * 
   */
  get_message(){
    if (this.datastack && this.datastack.length) {
      return this.datastack.shift()
    }
  }


  /**
   * Pour envoyer des données au script maitre
   * (cf. dans waa.rb le format des données)
   */
  send(data_message){
    // console.log("data_message dans send: ", data_message)
    // return false
    if (this.mode_test) { this.data_message_for_tests(data_message) }
    if(undefined == this.datastack) this.datastack = []
    if('string' != typeof data_message) data_message = JSON.stringify(data_message)
    // console.log("data_message dans send: ", data_message)
    // return false
    this.datastack.push(data_message)
  }

  /**
  * En mode test, on ajoute une propriété pour les données
  */
  data_message_for_tests(dmsg){
    dmsg.data || Object.assign(dmsg, {data: {}})
    Object.assign(dmsg.data, {__mode_test__: true})
  }

  /**
   * Pour recevoir des données du script maitre par un 'Message'
   * (cf. dans waa.rb le format des données)
   * 
   */
  receive(data_message){
    // return false
    try {
      try {
        data_message = JSON.parse(data_message)  
      } catch(err){
        data_message = data_message.replace(/\\/g, '\\\\')
        data_message = JSON.parse(data_message)
      }
    } catch(err){
      const err_msg = "Une erreur fatale est survenue. Consulter la console pour y remédier."
      erreur(err_msg)
      console.error("Impossible de dejissonner (JSON.parse) le message de retour : ", data_message, err)
      return false
    }

    Log.debug("[WAA.receive] data_message = ", data_message)
    // return false

    // 
    // Classe définie par le message
    // 
    let classe = eval(data_message.class)
    if ( ! classe ) { 
      const err_msg = `La classe "${data_message.class}" est inconnue.\nJe dois m'arrêter là.`
      console.error(err_msg)
      return erreur(err_msg) 
    }
    // 
    // Appeler la méthode définie par le message, avec les 
    // données définies (if any)
    // 
    if ( 'function' == typeof classe[data_message.method] ) {
      classe[data_message.method].call(classe, data_message.data)
    } else {
      const err_msg = `La méthode #${data_message.method} de la classe ${data_message.class} est inconnue…\nJe dois m'arrêter là.`
      console.error(err_msg)
      console.log("Classe Test : ", Test)
      return erreur(err_msg)
    }
    /*
    |  Cas spécial des tests InsideTest
    |  --------------------------------
    |  Si la propriété data_message.__ITData__ est définie, c'est 
    |  qu'une méthode régulière (ie hors-tests, une méthode normale 
    |  de l'application). Dans ce cas, il faut appeler la méthode
    |  IT_WAA qui doit réceptionner le retour. 
    |
    |  NOTE : ça ne coûte rien d'envoyer toutes les données remontées
    |  ça permettra au contraire de faire des tests dessus.
    */
    if ( isDefined(data_message.data.__ITData__) ) {
      IT_WAA.receive(data_message.data)
    }
    /*
    |  On retourne true pour le check
    */
    return true
  }

  /**
   * Pour recevoir une notification
   * 
   * Côté serveur, on appelle cette méthode par WAA.notify(msg,type)
   * 
   */
  onNotify(data){
    const msg = data.message
    switch(data.message_type){
      case 'error':
        erreur(msg)
        break
      default:
        message(msg)
    }
  }

  get state(){ return this._state || 1 }
  set state(v){ this._state = v }

  get mode_test() { return this._modetest || false }
  set mode_test(v){ this._modetest = v }

} // /class Waa

var WAA = new Waa();
