module WaaApp
class Server

  #
  # Méthode appelée au démarrage (avant le chargement de la page)
  # 
  def self.on_start_up
    Dashboard::App.on_start_up
  end

  #
  # Méthode appelée quand on passe en mode test
  # 
  def self.on_toggle_mode_test
    if WaaApp::Server.mode_test?
      puts "L'application passe en mode test.".bleu
      Dashboard::Task.make_backup
    else
      puts "L'application repasse en mode production.".bleu
    end
  end

end #/class Server
end #/module WaaApp
