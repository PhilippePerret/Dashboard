# encoding: UTF-8
require 'fileutils'
require 'yaml'
require 'csv'
require 'pretty_inspect'
require 'clir'

require_relative 'required/constants'


def require_folder(path)
  return unless File.exist?(path)
  Dir["#{path}/**/*.rb"].each{|m|require(m)}
end

# Y a-t-il un module toolbox propre ? Si oui, le charger
toolbox_module = File.join(APP_FOLDER,'toolbox.rb')
require toolbox_module if File.exist?(toolbox_module)

require_folder(File.join(LIB_FOLDER,'required','system'))
require_folder(File.join(LIB_FOLDER,'required','app'))
require_folder(File.join(LIB_FOLDER,'required','test'))
