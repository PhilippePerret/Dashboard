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

/*
|  Les résultat KDP, affichés en bas de fenêtre (footer#main)
*/
const styleSpanKDP = 'float:left;font-size:16pt;font-weight:bold;color:white;margin-top: 6px;margin-left: 12px;'
const spanKDP = DCreate('SPAN', {id:'kdp-resultats', style:styleSpanKDP})
;spanKDP.appendChild(DCreate('SPAN',{text:'KDP : '}))
;spanKDP.appendChild(DCreate('SPAN',{id:'kdp-nombre-ventes', text:'---'}))
spanKDP.appendChild(DCreate('SPAN',{text:' / '}))
spanKDP.appendChild(DCreate('SPAN',{id:'kdp-moyenne-ventes',text:'---'}))
const styleSpanTime = 'margin-left:1em;font-size:12pt;vertical-align:middle;'
spanKDP.appendChild(DCreate('SPAN',{id:'kdp-time',text:'', style:styleSpanTime}))
DGet('footer#main').appendChild(spanKDP)

// Les observers
listen(btnGotoKDP,'click',Toolbox.gotoKDP.bind(Toolbox))
listen(DGet('input',cbCheckKDP),'change', Toolbox.onToggleCheckKDP.bind(Toolbox))

Toolbox.data = {
  buttons: [
      cbCheckKDP
    , btnGotoKDP
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
      this.spanNombreVentes.innerHTML = `…`
      this.spanTime.innerHTML = '(' + DateUtils.currentTime() + ')'
      WAA.send({class:"Dashboard::Toolbox",method:"get_kdp_score", data:{ok:true}})
    } else {
      if ( retour.ok ) {
        /*
        |  Affichage du nombre de ventes et on lance le prochain
        */
        const oldNombreVentes = Number(retour.oldNombreVentes)
        const newNombreVentes = Number(retour.newNombreVentes)
        this.spanNombreVentes.innerHTML = `${newNombreVentes}`
        this.spanMoyenne.innerHTML = this.calcMoyenneVentes(newNombreVentes)
        this.spanTime.innerHTML = '(' + DateUtils.currentTime() + ')'
        this.kdpTimer = setTimeout(this.getKDPResult.bind(this), 5 * 60 * 1000 /* toutes les x minutes */)
        // console.log("nombreVentes = ", newNombreVentes, DateUtils.currentTime())
      } else {
        /*
        |  Erreur:
        */
        erreur(retour.msg)
      }
    }
  }

  // --- Les objets DOM ---

  static get spanNombreVentes(){
    return this._spanventes || (this._spanventes = DGet('span#kdp-nombre-ventes'))
  }
  static get spanMoyenne(){
    return this._spanmoy || (this._spanmoy = DGet('span#kdp-moyenne-ventes'))
  }
  static get spanTime(){
    return this._spantime || (this._spantime = DGet('#kdp-time'))
  }

  /**
  * Méthode qui calcule la moyenne des ventes du mois courant
  * et la @return.
  */
  static calcMoyenneVentes(nombreVentes){
    const nombreJours = new Date().getDate();
    let moyenne = Number.parseFloat(nombreVentes / nombreJours).toFixed(1)
    // console.log("Moyenne : ", moyenne)
    return moyenne
  }

}
