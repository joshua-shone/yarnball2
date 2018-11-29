var actions = [];
var actionsUndone = [];

function recordAction(action, options) {
  if (currentSurface === mainSurface) {
    action.options = options || {};
    actions.push(action);
    actionsUndone = [];
  } else if (currentSurface === findPanel) {
    highlightQueriedNodes();
  }
}

function undo() {
  var action = actions.pop();
  if (action) {
    setCurrentSurface(mainSurface);
    action.undo();
    actionsUndone.push(action);
    if (action.options.cursor) {
      setCursorPosition(action.options.cursor.before);
    }
    if (action.options.selectionBox) {
      if (action.options.selectionBox.before) {
        setSelectionBox(action.options.selectionBox.before);
        selectionBox.classList.remove('hidden');
      } else {
        selectionBox.classList.add('hidden');
      }
    }
  }
}

function redo() {
  var action = actionsUndone.pop();
  if (action) {
    setCurrentSurface(mainSurface);
    action.redo();
    actions.push(action);
    if (action.options.cursor) {
      setCursorPosition(action.options.cursor.after);
    }
    if (action.options.selectionBox) {
      if (action.options.selectionBox.after) {
        setSelectionBox(action.options.selectionBox.after);
        selectionBox.classList.remove('hidden');
      } else {
        selectionBox.classList.add('hidden');
      }
    }
  }
}


function deleteElementsAction(elements) {
  this.elements = elements;
  this.undo = () => {
    for (element of this.elements) {
      if (element.classList.contains('node')) {
        mainSurface.getElementsByClassName('nodes')[0].appendChild(element);
      } else if (element.classList.contains('link')) {
        mainSurface.getElementsByClassName('links')[0].appendChild(element);
        element.from.links.add(element);
        element.via.links.add(element);
        element.to.links.add(element);
      }
    }
  };
  this.redo = () => {
    deleteElements(this.elements);
  };
}

function createElementsAction(elements) {
  this.elements = elements;
  this.undo = () => {
    deleteElements(this.elements);
  };
  this.redo = () => {
    for (element of this.elements) {
      if (element.classList.contains('node')) {
        mainSurface.getElementsByClassName('nodes')[0].appendChild(element);
      } else if (element.classList.contains('link')) {
        mainSurface.getElementsByClassName('links')[0].appendChild(element);
        element.from.links.add(element);
        element.via.links.add(element);
        element.to.links.add(element);
      }
    }
  };
}

function createLinkAction(link) {
  this.link = link;
  this.undo = () => this.link.remove();
  this.redo = () => mainSurface.getElementsByClassName('links')[0].appendChild(this.link);
}

function pasteElementsAction(nodes, links) {
  this.nodes = nodes;
  this.links = links;
  this.undo = () => {
    for (node of this.nodes) node.remove();
    for (link of this.links) link.remove();
  };
  this.redo = () => {
    for (node of this.nodes) mainSurface.getElementsByClassName('nodes')[0].appendChild(node);
    for (link of this.links) mainSurface.getElementsByClassName('links')[0].appendChild(link);
  };
}

function moveNodesAction(positions) {
  this.oldPositions = positions.oldPositions;
  this.newPositions = positions.newPositions;
  this.undo = () => {
    var affectedLinks = new Set();
    for (i of this.oldPositions) {
      i.node.style.left = i.left;
      i.node.style.top  = i.top;
      for (link of i.node.links) affectedLinks.add(link);
    }
    for (link of affectedLinks) layoutLink(link);
  };
  this.redo = () => {
    var affectedLinks = new Set();
    for (i of this.newPositions) {
      i.node.style.left = i.left;
      i.node.style.top  = i.top;
      for (link of i.node.links) affectedLinks.add(link);
    }
    for (link of affectedLinks) layoutLink(link);
  };
}

function renameNodeAction(node, oldName) {
  this.node = node;
  this.oldName = oldName;
  this.newName = node.value;
  this.undo = () => {
    this.node.value = this.oldName;
    if (document.activeElement === this.node) {
      lastFocusedNodeOriginalName = this.node.value;
    }
  }
  this.redo = () => {
    this.node.value = this.newName;
    if (document.activeElement === this.node) {
      lastFocusedNodeOriginalName = this.node.value;
    }
  }
}