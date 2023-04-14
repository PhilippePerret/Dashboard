#!/usr/bin/env ruby
# encoding: UTF-8
=begin

  Script maitre d'une application WAA

  * Le rendre exécutable (chmod +x ./<main>.rb)
  * Faire un lien symbolique pour la commande :
    Pour une commande ma-commande, faire :
    ln -s /absolute/path/to/<main>.rb /usr/local/bin/ma-commande
    OU
    Faire un launcher bash (server.command) contenant :
    #!/usr/bin/env bash
    # 
    # Script pour lancer le serveur Puma qui recevra les url-runner
    # et les exécutera.
    # 

    dossier=$(dirname $(readlink -f "${BASH_SOURCE}"))
    # main_folder=$(dirname $(readlink -f "${dossier}"))

    ruby "${dossier}/server.rb"


=end

begin
  require_relative 'lib/required'
  WaaApp::Server.on_start_up
  WAA.goto File.join(__dir__,'main.html')
  WAA.run
rescue Exception => e
  puts"\033[0;91m#{e.message + "\n" + e.backtrace.join("\n")}\033[0m"
ensure
  WAA.driver.quit
end
