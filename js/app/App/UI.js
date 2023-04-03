'use strict';

class UI {
  static prepare(){
    DGetAll('.task-conteneur').forEach(div => $(div).sortable({axis:'y'}))
  }
}
