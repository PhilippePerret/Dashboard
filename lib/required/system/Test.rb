class WAATest
class << self
  def load_tests(sent_data)
    tests = 
      Dir["#{folder}/**/*.js"].map do |tpath|
        tpath.sub(/^#{folder}\//,'').sub(/\.js$/,'')
      end
    WAA.send(class:'Test',method:'onLoadTests',data:{tests: tests})
  end


  def folder
    @folder ||= File.join(APP_FOLDER,'js','test','tests')
  end
end #/<< self
end
