class WAATest
class << self

  ##
  # @param [Hash] data Les données
  # @option data [String] poursuivre La méthode de la class Test à appeler une fois les tâches initiales installées.
  #                       Dans le fichier de test, c'est une méthode définie par :
  #                         Test.maMethodeDeTest = function(){ ... }
  #                         WAA.send({class:'WAATest', method:'customInit', data:{poursuivre:'maMethodeDeTest'}})
  #
  def customInit(data)
    puts "Initialisation customisée des tests".jaune
    data.key?('poursuivre') || begin
      puts <<~ERROR.rouge
      Il est impératif de définir la méthode poursuivre dans les données 
      envoyées par WAA.send (avec la propriété data.poursuivre qui doit 
      renseigner la méthode de la classe javascript Test pour poursuivre 
      — donc le test à jouer)

      Je dois interrompre les tests ici.
      ERROR
      return
    end
    #
    # Il faut (re)mettre les tâches de base 
    #
    FileUtils.rm_rf(Dashboard::Task.folder) if File.exist?(Dashboard::Task.folder) && Dashboard::Task.folder.match?('Dashboard')
    degel('depart')
    #
    # Il faut mettre la date de la tâche 25 à plus tard
    # 
    task25_path = File.join(Dashboard::Task.folder,'depart','todo-25.yaml')
    task25_data = YAML.load_file(task25_path, **YAML_OPTIONS)
    now = Time.now + 2 * 3600 * 24
    task25_data['start'] = "#{now.year}-#{now.month.to_s.rjust(2,'0')}-#{now.day.to_s.rjust(2,'0')}"
    File.write(task25_path, task25_data.to_yaml)
    WAA.send({class:'Test',method:data['poursuivre'],data:{}})
  end

  def degel(folder_name)
    gel_path = File.join(gels_folder,folder_name)
    FileUtils.cp_r("#{gel_path}", File.join(File.dirname(Dashboard::Task.folder),'todos'))    
  end

  def gels_folder
    @gels_folder ||= File.join(APP_FOLDER,'tmp','tests','gels')
  end
end #/<< self
end #/class WAATest
