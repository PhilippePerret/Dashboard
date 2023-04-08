'use strict';
/**
 * 
 * Utilitaire pour DOM
 * 
 * verion 2.1
 * 
 * 
 */

function px(nombre){
  return `${nombre}px`
}

function unpx(valeur){
  return Number(valeur.substring(0, valeur.length - 2))
}


function listen(objet, eventType, method){
  objet.addEventListener(eventType, method)
}
function unlisten(objet, eventType, method){
  objet.removeEventListener(eventType, method)
}

function stopEvent(e){
  e.preventDefault()
  e.stopPropagation()
  return false
}

function DGet(selector, container){
  container = container || document
  return container.querySelector(selector)
}
function DGetAll(selector, container){
  container = container || document
  return container.querySelectorAll(selector)
}

function DCreate(tagName,attrs){
  attrs = attrs || {}
  const isCheckboxSpan = tagName.toLowerCase() == 'input' && (attrs.type && attrs.type.toLowerCase() == 'checkbox') && attrs.label
  var o ;
  if ( isCheckboxSpan ) {
    o = DCreateCheckbox(attrs)
    delete attrs.label
    delete attrs.type
    delete attrs.checked
  } else {
    o = document.createElement(tagName);
  }
  for(var attr in attrs){
    var value = attrs[attr]
    switch (attr) {
      case 'text':
        o.innerHTML = value;
        break;
      case 'inner':
        if ( !Array.isArray(value) ) value = [value]
        value.forEach(obj => o.appendChild(obj))
        break;
      case 'css':
      case 'class':
        o.className = value;
        break;
      default:
        o.setAttribute(attr, value)
    }
  }
  return o;
}

/**
* Construction d'un Checkbox
* 
* @note
*   Pour utiliser cette méthode, appeler DGet avec le tagname
*   'INPUT' et le type 'checkbox' et une propriété :label.
*   Par exemple :
*     DGet('INPUT', {type:'checkbox', label:"Case à cocher", checked:true})
* 
*/
function DCreateCheckbox(attrs){
  window.lastIdCb || (window.lastIdCb = 0)
  const cbId    = attrs.id || `cb-${++ window.lastIdCb}` ;
  const spanId  = `span-${cbId}`
  const o = document.createElement('SPAN', {id:spanId});
  attrs.id = spanId // pour qu'il soit appliqué après
  const cb = DCreate('INPUT',{type:'checkbox', id: cbId})
  cb.checked = !!attrs.checked
  const label = DCreate('LABEL',{for:cbId, text:attrs.label})
  o.appendChild(cb)
  o.appendChild(label)

  return o
}

class DOM {
  static showIf(domEl, condition){
    domEl[condition ? 'removeClass' : 'addClass']('hidden')
    return condition
  }
  constructor(domEl){
    this.obj = domEl
  }
  showIf(condition){ return this.constructor.showIf(this.obj, condition)}
}
