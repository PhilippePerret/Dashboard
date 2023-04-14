# encoding: UTF-8

LIB_FOLDER = File.dirname(__dir__)
APP_FOLDER = File.dirname(LIB_FOLDER)
TMP_FOLDER = mkdir(File.join(APP_FOLDER,'tmp'))

#
# Dossier dans lequel on a ouvert le Terminal
# 
CURRENT_FOLDER = File.expand_path('.')


YAML_OPTIONS = {symbolize_names:true, permitted_classes: [Date, Time, Symbol]}

#
# Constantes à définir dynamiquement (à chaque chargement de l'app
# au départ — mais pas au rechargement de la page HTML dans le 
# browser). Elles seront accessibles par javascript.
#
DYNAMIC_JS_CONSTANTES = [
  ['APP_FOLDER'     , APP_FOLDER],
  ['CURRENT_FOLDER' , CURRENT_FOLDER]
]
