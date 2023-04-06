# encoding: UTF-8
module Dashboard
class App
class << self

  def get_kdp_score(params)
    ok  = true
    msg = nil
    url = "https://kdpreports.amazon.com/orders"
    profile = "KDP Amazon"

    opts = Selenium::WebDriver::Firefox::Options.new(
      profile: 'KDP Amazon',
    )
    opts.headless!
    driver = Selenium::WebDriver.for(:firefox, options: opts)
    driver.navigate.to(url)
    sleep 5
    msg = nil
    begin
      msg = driver.execute_script("return document.querySelector('div.hero-number > div').innerHTML")
    rescue Selenium::WebDriver::Error::JavascriptError => e
      msg = "Erreur javascript : #{e.message}"
      ok = false
    ensure
      driver.quit if driver
    end
    WAA.send({class:'App',method:'getKDPResult',data:{ok:ok,msg:msg}})

  end
end #/<< self
end #/class App
end #/module Proximot
