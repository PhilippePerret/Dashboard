class WAATest
class << self

  def customInit(data)
    puts "Initialisation customisée des tests".jaune
    #
    # Il faut prendre les tâches de base 
    #
    FileUtils.rm_rf(Dashboard::Task.folder) if File.exist?(Dashboard::Task.folder) && Dashboard::Task.folder.match?('Dashboard')
    degel('depart')
    #
    # Il faut mettre la date de la tâche 25 à plus tard
    # 
    task25_path = File.join(Dashboard::Task.folder,'todo-25.yaml')
    task25_data = YAML.load_file(task25_path, **Dashboard::Task.options_yaml)
    now = Time.now + 2 * 3600 * 24
    puts "now : #{now}".bleu
    task25_data['start'] = "#{now.year}-#{now.month.to_s.rjust(2,'0')}-#{now.day.to_s.rjust(2,'0')}"
    File.write(task25_path, task25_data.to_yaml)
    WAA.send({class:'Test',method:'runTestChargement',data:{}})
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
