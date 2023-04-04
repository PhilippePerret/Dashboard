require 'date'
require 'osascript'
module Dashboard
class Task
class << self

  ##
  # Chargement de toutes les tâches courantes (sans filtre)
  # 
  def load(params)
    WAA.send({class:'Todo',method:'onLoad',data:{
      ok: true,
      msg:"Je dois apprendre à remonter les tâches.",
      todos: get_all_tasks
    }})
  end

  ##
  # Marquage d'une tâche comme accomplie
  #
  def mark_done(params)
    task = new(params['task_id'])
    puts "Marquer la tâche ##{task.id} comme accomplie"
    task.mark_done
    ok = File.exist?(task.archive_path) && not(File.exist?(task.path))
    msg = ok ? nil : "Apparemment, le déplacement vers les archives n'a pas pu se faire…"
    WAA.send({class:"Todo.get(#{task.id})",method:'onMarkDone',data:{
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
    WAA.send({class:"Todo.get(#{task.id})", method:'onSaved', data:{ok:ok, msg:msg}})
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
    Dir["#{folder}/*.yaml"].map do |fpath|
      YAML.load_file(fpath, **options_yaml)
    end
  end

  def options_yaml
    @options_yaml ||= {permitted_classes: [Date, Time, Symbol], symbolize_names:true}
  end

  def folder
    @folder ||= File.join(APP_FOLDER,'data','todos')
  end

  def archives
    @archives ||= File.join(APP_FOLDER,'data','xarchives')
  end
end #/<< self

###################       INSTANCE      ###################

attr_reader :id
def initialize(id, data = nil)
  @id   = id
  @data = data
end

def mark_done
  now = Time.now
  now2revdata = "#{now.year}-#{now.month}-#{now.day}"
  new_data = data.merge(done: now2revdata)
  File.write(path, new_data.to_yaml)
  sleep 0.1
  FileUtils.mv(path, archive_path)
end

def save
  data.key?('created_at') || data.merge!('created_at' => Time.now.to_s)
  data.merge!('updated_at' => Time.now.to_s)
  # File.write(path, data.to_yaml)
  File.write(path, YAML.dump(data))
end

def run
  if data[:action].nil?
    ok  = false
    msg = "Aucune action n'est définie pour cette tâche ##{id}…"
  else
    ok = true
    msg = nil
    begin
      case data[:atype]
      when 'open_edi'
        `subl "#{data[:action]}"`
      when 'run'
        cmd = "/usr/local/bin/run #{data[:action]} 2>&1\n"
        puts "Bash-commande jouée : #{cmd.inspect}".bleu
        res = nil
        if Osascript.on?('Terminal')
          Osascript::Key.press([
            {key:'n',modifiers:[:command]}
          ], 'Terminal')
        end
        res = Osascript::Key.press([cmd], 'Terminal')
        # thr = Thread.new { res = system(cmd) } # fonctionne, mais dans la même fenêtre
        # thr.join
        if res != ''
          ok = false
          msg = res
        end
      when 'rcode'
        eval(data[:action])
      when 'bcode'
        `#{data[:action]}`
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
  WAA.send({class:"Todo.get(#{self.id})",method:'onRan',data:{ok:ok,msg:msg}})
end

def remove
  File.delete(path)
  ok = not(File.exist?(path))
  WAA.send(class:"Todo.get(#{self.id})",method:'onRemoved', data:{
    ok: ok,
    msg: ok ? nil : "Le fichier #{self.name.inspect} aurait dû être détruit…"
  })
end

def data
  @data ||= YAML.load_file(path, **self.class.options_yaml)
end

def archive_path
  @archive_path ||= File.join(self.class.archives,name)
end
def path
  @path ||= File.join(self.class.folder,name)
end
def name
  @name ||= "todo-#{id}.yaml"
end
end #/Task
end #/module Dashboard
