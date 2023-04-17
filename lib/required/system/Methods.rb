class Methods
class << self

  ##
  # Utiliser la méthode javascript 'say(message, options)' pour faire
  # dire quelque chose à l'ordinateur
  # 
  def say(data)
    `say  -v Aurélie "#{data['message']}"`
  end

end #/<< self
end #/Methods
