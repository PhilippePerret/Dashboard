'use strict';
/**
* Pour la gestion des dates
* 
* Contient la classe DateUtils (cf. plus bas)
*/




const MOIS = {
  1:{court:'jan',long:'janvier'},
  2:{court:'fév',long:'février'},
  3:{court:'mars',long:'mars'},
  4:{court:'avr',long:'avril'},
  5:{court:'mai',long:'mai'},
  6:{court:'juin',long:'juin'},
  7:{court:'juil',long:'juillet'},
  8:{court:'aout',long:'aout'},
  9:{court:'sept',long:'septembre'},
  10:{court:'oct',long:'octobre'},
  11:{court:'nov',long:'novembre'},
  12:{court:'déc',long:'décembre'},
}

class DateUtils {

  static dayCountBetween(date1, date2){
    return Math.abs(Number(date2 - date1)) / (24*3600*1000)
  }

  // "<annee>-<mois>-<jour>" (p.e. "2023-04-09") ===> <Date>
  static revdate2date(revdate){
    var [annee, mois, jour] = revdate.split('-')
    return new Date(Number(annee), Number(mois)-1, Number(jour))
  }

  // <Date> ===> "<annee>-<mois>-<jour>" (p.e. "2023-04-09")
  static date2revdate(date){
    return new DateUtils(date).asRevdate()
  }

  // <Date> => "le <jour>" / "<jour> <mois>" / "<jour> <moi> <année>"
  // @reçoit une [Date] et retourne la date minimale suivant la
  // date courante. Par exemple, si on est le 8 mars 2023, le 16 mars
  // 2023 sera marqué "le 16", le 10 avril 2023 sera marqué "10 avril"
  // et le 12 mars 2024 sera marqué "12 mars 2024"
  static date2hdatemin(date, long){
    const udate = new DateUtils(date)
    if ( long ) {
      return udate.date2hdatemin_long
    } else {
      return udate.date2hdatemin_court
    }
  }


  static get today(){return NOW}
  static get tomorrow(){
    if ( undefined == this._tomorrow ) {
      let d = new Date()
      d.setDate( NOW.getDate() + 1)
      this._tomorrow = new DateUtils(d)
    } return this._tomorrow
  }
  static get afterTomorrow(){
    if ( undefined == this._aftertom ) {
      let d = new Date()
      d.setDate( NOW.day + 2)
      this._aftertom = new DateUtils(d)
    } return this._aftertom
  }


  constructor(date){
    this.date = date
  }

  date2hdatemin(long){
    if ( this.mois == NOW.mois && this.year == NOW.year ) {
      return this.day
    }
    var pars = [this.hday]
    pars.push(long ? this.hmois_long : this.hmois_court)
    if ( this.year != NOW.year ) { pars.push(this.year) }
    return pars.join(' ')
  }

  get date2hdatemin_long(){
    return this.date2hdatemin(true)
  }
  get date2hdatemin_court(){
    return this.date2hdatemin(false)
  }


  get day     (){return this.date.getDate()}
  get hday    (){return this.day == 1 ? '1er' : this.day}
  get wday    (){throw "Je ne sais pas encore calculer le jour de la semaine."}
  get year    (){return this.date.getFullYear() }
  get month   (){return this.date.getMonth()}
  get mois    (){return this.month + 1 }
  get hmois_court (){return MOIS[this.mois].court}
  get hmois_long  (){return MOIS[this.mois].long}
  get mois2   (){
    if ( undefined == this._mois2 ) {
      let m = this.mois
      m > 9 || (m = `0${m}`)
      this._mois2 = m
    } return this._mois2
  }
  get jour2(){
    if ( undefined == this._jour2 ) {
      let j = this.date.getDate()
      j > 9 || (j = `0${j}`)
      this._jour2 = j
    } return this._jour2
  }

  asRevdate(){
    if ( undefined == this._revdate ) {
      this._revdate = [this.year,this.mois2,this.jour2].join('-')
    }; return this._revdate
  }
}

const NOW = new DateUtils(new Date())
const d = NOW
// const TODAY_START = new Date(d.getFullYear(),d.getMonth(), d.getDate(),0,0,0)
// const TODAY_END   = new Date(d.getFullYear(),d.getMonth(), d.getDate(),23,59,59)
const TODAY_START = new Date(d.year, d.month, d.day, 0,0,0)
const TODAY_END   = new Date(d.year, d.month, d.day, 23,59,59)
