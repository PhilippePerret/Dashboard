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


  def get_all_tasks
    Dir["#{folder}/*.yaml"].map do |fpath|
      YAML.load_file(fpath)
    end
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
def initialize(id)
  @id = id
end

def mark_done
  now = Time.now
  now2revdata = "#{now.year}-#{now.month}-#{now.day}"
  new_data = data.merge(done: now2revdata)
  File.write(path, new_data.to_yaml)
  sleep 0.1
  FileUtils.mv(path, archive_path)
end

def data
  @data ||= YAML.load_file(path, **{symbolize_names:true})
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
