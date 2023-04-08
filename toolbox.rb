module Dashboard
class Toolbox
class << self

  def goto_kdp(params)
    profile = 'Amazon KDP'
    # cmd = "/Applications/Firefox.app/Contents/MacOS/firefox -P \"#{profile}\" --class \"#{profile}Profile\" https://kdpreports.amazon.com/orders"
    cmd = "/Applications/Firefox.app/Contents/MacOS/firefox -P \"#{profile}\" --class \"#{profile}Profile\""
    `#{cmd}`
  end

  ##
  # Méthode appelée pour relever le nombre de ventes courantes
  # (sur Amazon:KDP)
  def get_kdp_score(params)
    retour = {
      ok:true, 
      msg:nil, 
      newNombreVentes:nil, 
      oldNombreVentes: get_old_nombre_ventes,
    }

    url = "https://kdpreports.amazon.com/orders"
    profile = "KDP Amazon"

    opts = Selenium::WebDriver::Firefox::Options.new(
      profile: 'KDP Amazon',
    )
    opts.headless!
    driver = Selenium::WebDriver.for(:firefox, options: opts)
    driver.navigate.to(url)
    begin
      retour[:newNombreVentes] = get_hero_number(driver)
    rescue Selenium::WebDriver::Error::JavascriptError => e
      retour[:msg] = "Erreur javascript : #{e.message}"
      retour[:ok] = false
    ensure
      driver.quit if driver
    end
    # puts "retour[:newNombreVentes] = #{retour[:newNombreVentes]}"
    # puts "retour[:oldNombreVentes] = #{retour[:oldNombreVentes]}"
    if retour[:newNombreVentes].to_i > retour[:oldNombreVentes].to_i
      diff = retour[:newNombreVentes].to_i - retour[:oldNombreVentes].to_i
      diff = "une" if diff == 1
      `say "Il y a #{diff} nouvelles ventes K D P. Le nombre total est de #{retour[:newNombreVentes]} livres"`
      set_old_nombre_ventes(retour[:newNombreVentes])
    end
    WAA.send({class:'KDP',method:'getKDPResult',data:retour})
  end

  HERO_NUMBER_SCRIPT = <<~JAVASCRIPT
  const divHero = document.querySelector('div.hero-number');
  if ( divHero ) {
    return document.querySelector('div.hero-number > div').innerHTML;
  } else {
    return ''
  }
  JAVASCRIPT
  def get_hero_number(driver)
    sleep 3
    Timeout.timeout(120) do
      while true
        response = driver.execute_script(HERO_NUMBER_SCRIPT)
        return response if response != ""
        sleep 2
      end
    end
  end

  def set_old_nombre_ventes(nb)
    File.write(nombre_ventes_path, nb.to_s)
  end
  def get_old_nombre_ventes
    File.read(nombre_ventes_path).strip
  end
  def nombre_ventes_path
    @nombre_ventes_path ||= File.join(APP_FOLDER,'data',"nbventes")
  end

end #/<< self
end #/Toolbox
end #/module Dashboard
