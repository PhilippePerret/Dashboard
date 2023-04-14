module WaaApp
class Server
class << self

  def mode_test?
    File.exist?(mode_test_path)
  end

  def set_mode_test(data)
    File.write(mode_test_path, Time.now.to_i.to_s)
    if self.respond_to?(:on_toggle_mode_test)
      self.on_toggle_mode_test
    end
    WAA.send(data['poursuivre'].merge({data:{ok:true}}))
  end

  def unset_mode_test(data)
    File.delete(mode_test_path) if File.exist?(mode_test_path)    
    WAA.send(data['poursuivre'].merge({data:{ok:true}})) if data['poursuivre']
  end

  def mode_test_path
    @mode_test_path ||= File.join(TMP_FOLDER,'.MODE_TEST')
  end
end #/<< self Server
end #/class Server
end #/module WaaApp
