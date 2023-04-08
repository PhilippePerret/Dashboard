module Dashboard
class Toolbox
class << self

  ##
  # Méthode qui regarde si le fichier 'toolbox.js' de l'utilisateur,
  # existe. 
  # @rappel
  #   Ce module définit la boite à outils propre à l'utilisateur
  #
  def check_if_exists(data)
    WAA.send(class:'Toolbox',method:'setup',data:{
      ok: true,
      has_custom_toolbox: File.exist?(File.join(APP_FOLDER,'toolbox.js')),
      msg: nil
    }) 
  end

end #/<< self
end #/class Toolbox
end #/module Dashboard
