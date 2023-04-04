'use strict';
/**
* Pour la gestion des dates
*/

const NOW = new Date()
const d = NOW
const TODAY_START = new Date(d.getFullYear(),d.getMonth(), d.getDate(),0,0,0)
const TODAY_END   = new Date(d.getFullYear(),d.getMonth(), d.getDate(),23,59,59)


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

  static revdate2date(revdate){
    var [annee, mois, jour] = revdate.split('-')
    return new Date(Number(annee), Number(mois)-1, Number(jour))
  }
  static get today(){return new DateUtils(NOW)}
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
      d.setDate( NOW.getDate() + 2)
      this._aftertom = new DateUtils(d)
    } return this._aftertom
  }


  constructor(date){
    this.date = date
  }

  get year(){ return this.date.getFullYear() }
  get mois2(){
    if ( undefined == this._mois2 ) {
      let m = this.date.getMonth() + 1
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

