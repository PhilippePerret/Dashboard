# encoding: UTF-8
require 'timeout'

module Dashboard
class App
class << self

  ##
  # Méthode appelée au tout départ, lorsqu’on lance le serveur
  # 
  def on_start_up

    # Si c’est le premier appel de la journée :
    #   - on supprime le mode test s’il est enclenché
    #   - on fait un backup des données
    # 
    exec_first_day_call if first_day_call?
    #
    # On consigne toujours le dernier appel
    # 
    consigne_last_call

  end

  ##
  # Pour obtenir un chemin d'accès dans le dossier des données per-
  # nelles de l'user
  # 
  # @note
  #   Le chemin d'accès tient compte du mode test.
  # 
  def data_folder(key)
    # unless main_data_folder.match?(/tmp/)
    #   puts "main_data_folder = #{main_data_folder.inspect}"
    #   puts "Il devrait être le dossier temporaire".rouge
    #   exit
    # end
    File.join(main_data_folder, key)
  end

  def main_data_folder
    if WaaApp::Server.mode_test?
      mkdir(File.join(APP_FOLDER,'tmp','tests','data'))
    else
      mkdir(File.join(APP_FOLDER,'data'))
    end
  end


  private

    ##
    # Consignation du dernier appel au server
    # 
    def consigne_last_call
      new_hot_data = hot_data.merge(last_server_start: Time.now)
      save_hot_data(new_hot_data)
    end

    # @return true si c’est le premier appel du jour
    # 
    # On le sais 1) si le fichier ./tmp/hot.yaml n’existe pas
    # encore ou si la date de dernier démarrage qu’il contient date 
    # d’hier
    def first_day_call?
      now = Time.now
      today_beginning = Time.new(now.year,now.month,now.day,0,0,0)
      return not(File.exist?(hot_data_path)) || hot_data[:last_server_start] < today_beginning
    end

    ##
    # Méthode à appeler quand c’est le tout premier appel du jour
    # 
    def exec_first_day_call
      #
      # Un premier appel ne peut pas être en mode test
      # 
      WaaApp::Server.unset_mode_test if WaaApp::Server.mode_test?
      #
      # On fait un backup des données
      # 
      Task.make_backup
    end

    #
    # === HOT DATA ===
    # 

    ##
    # Sauvegarde les données hot
    # 
    # @note
    #   Noter qu'elles ne sont pas mises en cache
    # 
    def save_hot_data(data)
      File.write(hot_data_path, data.to_yaml)
    end

    def hot_data
      if File.exist?(hot_data_path)
        YAML.load_file(hot_data_path,**YAML_OPTIONS)
      else
        {}
      end
    end
    def hot_data_path
      @hot_data_path ||= File.join(TMP_FOLDER,'hot.yaml')
    end


end #/<< self
end #/class App
end #/module Proximot
