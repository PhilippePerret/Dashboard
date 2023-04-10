# encoding: UTF-8
require 'timeout'

module Dashboard
class App
class << self

  ##
  # Pour obtenir un chemin d'accès dans le dossier des données per-
  # nelles de l'user
  # 
  # @note
  #   Le chemin d'accès tient compte du mode test.
  # 
  def data_folder(key)
    File.join(main_data_folder, key)
  end

  def main_data_folder
    @main_data_folder ||= begin
      if WAA.mode_test?
        mkdir(File.join(APP_FOLDER,'tmp','tests'))
      else
        mkdir(File.join(APP_FOLDER,'data'))
      end
    end
  end

end #/<< self
end #/class App
end #/module Proximot
