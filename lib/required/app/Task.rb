require 'date'
require 'osascript'
require 'zip'

module Dashboard
class Task
class << self

  # Appelée au changement de mode_test
  def reset_all
    @all_tasks = nil
    @folder         = nil
    @backups_folder = nil
    @archives       = nil
  end

  ##
  # Chargement de toutes les tâches courantes (sans filtre)
  # 
  def load(params)
    @all_tasks = nil
    # puts "Longueur de la donnée tâches à remonter : #{get_all_tasks.inspect.length}"
    WAA.send({class:'Task',method:'onLoad',data:{
      ok: true,
      msg: nil,
      todos: get_all_tasks
    }})
  end

  ##
  # Marquage d'une tâche comme accomplie
  #
  def mark_done(params)
    task = new(params['task_id'])
    puts "Tâche ##{task.id} marquée accomplie".bleu
    task.mark_done
    ok = File.exist?(task.archive_path) && not(File.exist?(task.path))
    msg = ok ? nil : "Apparemment, le déplacement vers les archives n'a pas pu se faire…"
    WAA.send({class:"Task.get(#{task.id})",method:'onMarkDone',data:{
      ok: ok, 
      msg:"Pas encore fait, juste pour voir l'identifiant"
    }})
  end

  ##
  # Enregistrement d'une tâche
  # 
  def saveTask(params)
    data = params['task_data']
    task = new(data['id'], data)
    task.save
    ok = File.exist?(task.path)
    msg = ok ? nil : "Le fichier #{task.name} est introuvable…"
    WAA.send({class:"Task.get(#{task.id})", method:'onSaved', data:{ok:ok, msg:msg}})
  end

  ##
  # Jouer l'action (run) d'une tâche
  # 
  def runTask(params)
    task = new(params['task_id'])
    task.run
  end

  def removeTask(params)
    task = new(params['task_id'])
    task.remove
  end


  def get_all_tasks
    @all_tasks ||= begin
      puts "Chargement des tâches depuis #{folder}"
      Dir["#{folder}/*.yaml"].map do |fpath|
        YAML.load_file(fpath, **YAML_OPTIONS)
      end
    end
  end



  #
  # === BACKUPS ===
  # 

  def make_backup
    backup_name = "backup-#{Time.now.strftime('%y-%m-%d-%H-%M')}.zip"
    backup_path = File.join(backups_folder, backup_name)
    File.delete(backup_path) if File.exist?(backup_path)
    #
    # On zippe toutes les données
    # 
    Zip::File.open(backup_path, Zip::File::CREATE) do |zipfile|
      Dir["#{folder}/*.yaml"].each do |fpath|
        zipfile.add("todos/#{File.basename(fpath)}", fpath)
      end
      Dir["#{archives}/*.yaml"].each do |fpath|
        zipfile.add("xarchives/#{File.basename(fpath)}", fpath)
      end
    end
    #
    # Confirmation
    # 
    if File.exist?(backup_path)
      puts "Backup des données réelles effectué avec succès.".vert
    else
      puts "Bizarrement, je n'ai pas pu faire le backup des données…".rouge
    end
  end


  #
  # === PATH ===
  # 
  
  def folder
    mkdir(App.data_folder('todos'))
  end

  def backups_folder
    @backups_folder ||= mkdir(File.join(APP_FOLDER,'data','xbackups'))
  end

  def archives
    mkdir(App.data_folder('xarchives'))
  end


end #/<< self

###################       INSTANCE      ###################

attr_reader :id
def initialize(id, data = nil)
  @id   = id
  @data = data
end

def mark_done
  @data = nil # sinon, problème avec tests
  now = Time.now
  now2revdata = "#{now.year}-#{now.month}-#{now.day}"
  new_data = data.merge(done: now2revdata)
  File.write(path, new_data.to_yaml)
  sleep 0.1
  FileUtils.mv(path, archive_path)
end

def save
  @data = nil if data_read_from_file? # sinon, problème avec tests
  data.key?('created_at') || data.merge!('created_at' => Time.now.to_s)
  data.merge!('updated_at' => Time.now.to_s)
  File.write(path, YAML.dump(data))
end

def run
  if data[:action].nil?
    ok  = false
    msg = "Aucune action n'est définie pour cette tâche ##{id}…"
  else
    ok = true
    msg = nil
    action = data[:action]
    begin
      case data[:atype]
      when 'open_edi'
        `subl "#{action}"`
      when 'run'
        cmd = "run #{action} 2>&1\n"
        # cmd = "/usr/local/bin/run #{action} 2>&1\n"
        puts "Bash-commande jouée : #{cmd.inspect}".bleu
        res = nil
        keys = []
        keys << {key:'n',modifiers:[:command]} if Osascript.on?('Terminal')
        keys << cmd
        Osascript::Key.press(keys, 'Terminal')
      when 'url_kpd'
        ok = false
        "/Applications/Firefox.app/Contents/MacOS/firefox -P \"KDP Amazon\" --class \"KDP AmazonProfile\" #{action}"
      when 'rcode'
        eval(action)
      when 'bcode'
        `#{action}`
      when 'open'
        msg = "Je dois apprendre à ouvrir un fichier ou un dossier"
      when 'url'
        msg = "Je dois apprendre à rejoindre une URL"
      end
    rescue Exception => e
      ok = false
      msg = e.message + "\n" + e.backtrace.join("\n")
      puts msg.rouge
    end
  end
  WAA.send({class:"Task.get(#{self.id})",method:'onRan',data:{ok:ok,msg:msg}})
end

def remove
  File.delete(path)
  ok = not(File.exist?(path))
  WAA.send(class:"Task.get(#{self.id})",method:'onRemoved', data:{
    ok: ok,
    msg: ok ? nil : "Le fichier #{self.name.inspect} aurait dû être détruit…"
  })
end

def data_read_from_file?
  @is_data_read_from_file === true
end

def data
  @data ||= begin
    @is_data_read_from_file = true # pour les tests, pour savoir s'il faut initialiser @data
    YAML.load_file(path, **YAML_OPTIONS)
  end
end

def archive_path
  File.join(self.class.archives,name)
end
def path
  File.join(self.class.folder,name)
end
def name
  @name ||= "todo-#{id}.yaml"
end
end #/Task
end #/module Dashboard
