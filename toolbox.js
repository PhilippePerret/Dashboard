'use strict';

// - Les méthodes d'observation -
Toolbox.gotoKDP = function(ev){
  WAA.send({class:'Dashboard::Toolbox',method:'goto_kdp',data:{}})
}
Toolbox.onToggleCheckKDP = function(ev){
  const cb = DGet('#cb-check-kdp')
  if ( cb.checked ) {
    KDP.getKDPResult()    
  } else {
    KDP.stopCheck()
  }
}

// Les objets
const btnGotoKDP = DCreate('BUTTON',{text:"Rejoindre KDP"})
const cbCheckKDP = DCreate('INPUT', {type:'checkbox', id:'cb-check-kdp', label:'Vérifier les ventes KDP'})

// Les observers
listen(btnGotoKDP,'click',Toolbox.gotoKDP.bind(Toolbox))
listen(DGet('input',cbCheckKDP),'change', Toolbox.onToggleCheckKDP.bind(Toolbox))

Toolbox.data = {
  buttons: [
    cbCheckKDP,
    btnGotoKDP,
  ]
}


class KDP {

  static stopCheck(){
    this.kdpTimer && clearTimeout(this.kdpTimer)
  }

  static getKDPResult(retour){
    this.kdpTimer && clearTimeout(this.kdpTimer)
    if (undefined == retour) {
      // TODO Il faut pouvoir insérer des éléments dans l'interface
      DGet('span#kdp-nombre-ventes').innerHTML = `…`
      DGet('span#kdp-time').innerHTML = DateUtils.currentTime()
      WAA.send({class:"Dashboard::Toolbox",method:"get_kdp_score", data:{ok:true}})
    } else {
      if ( retour.ok ) {
        /*
        |  Affichage du nombre de ventes et on lance le prochain
        */
        const oldNombreVentes = Number(retour.oldNombreVentes)
        const newNombreVentes = Number(retour.newNombreVentes)
        DGet('span#kdp-nombre-ventes').innerHTML = `${newNombreVentes}`
        DGet('span#kdp-time').innerHTML = DateUtils.currentTime()
        this.kdpTimer = setTimeout(this.getKDPResult.bind(this), 5 * 60 * 1000 /* toutes les x minutes */)
        console.log("nombreVentes = ", newNombreVentes, DateUtils.currentTime())
      } else {
        /*
        |  Erreur:
        */
        erreur(retour.msg)
      }
    }
  }

}
