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

}

