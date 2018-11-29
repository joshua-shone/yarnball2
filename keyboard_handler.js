var keyboard_handler = {
  HOME:       event => setCursorPosition({x: 32, y: 16}),

  ENTER:      event => insertNodeAtCursor({moveAdjacent: 'down' }),
  ShiftENTER: event => insertNodeAtCursor({moveAdjacent: 'up'   }),
  ' ':        event => insertNodeAtCursor({moveAdjacent: 'right'}),

  CtrlA:      event => selectAll(),
  CtrlShiftA: event => deselectAll(),

  CtrlC:      event => selectionToClipboard(),
  CtrlX:      event => selectionToClipboard({cut: true}),

  CtrlF:      event => openFindPanel(),
  CtrlENTER:  event => moveSelectionToQueriedNodes(),

  ARROWLEFT:   event => moveCursorInDirection('left'),
  ARROWRIGHT:  event => moveCursorInDirection('right'),
  ARROWUP:     event => moveCursorInDirection('up'),
  ARROWDOWN:   event => moveCursorInDirection('down'),

  ShiftARROWLEFT:   event => moveCursorInDirection('left',  {dragSelectionBox: true}),
  ShiftARROWRIGHT:  event => moveCursorInDirection('right', {dragSelectionBox: true}),
  ShiftARROWUP:     event => moveCursorInDirection('up',    {dragSelectionBox: true}),
  ShiftARROWDOWN:   event => moveCursorInDirection('down',  {dragSelectionBox: true}),

  CtrlARROWLEFT:  event => moveSelectionInDirection('left'),
  CtrlARROWRIGHT: event => moveSelectionInDirection('right'),
  CtrlARROWUP:    event => moveSelectionInDirection('up'),
  CtrlARROWDOWN:  event => moveSelectionInDirection('down'),

  AltARROWLEFT:   event => scrollMainSurfaceInDirection('left'),
  AltARROWRIGHT:  event => scrollMainSurfaceInDirection('right'),
  AltARROWUP:     event => scrollMainSurfaceInDirection('up'),
  AltARROWDOWN:   event => scrollMainSurfaceInDirection('down'),

  DELETE:     event => deleteSelection(),
  ESCAPE:     event => cancelCurrentModeOrOperation(),

  TAB:        event => executeLinkMode(),

  CtrlS:      event => saveState(),

  CtrlZ:      event => undo(),
  CtrlShiftZ: event => redo(),

  F1: event => toggleHelp(),

  F10: event => {
    if (document.activeElement && document.activeElement.classList.contains('node')) {
      var html = compileHtml(document.activeElement);
      var window_ = window.open("", "Yarnball compiled HTML");
      window_.document.write(html);
    }
  },
}

document.body.addEventListener('keydown', event => {

  var keyWithModifiers = (event.ctrlKey  ? 'Ctrl'  : '') +
                         (event.altKey   ? 'Alt'   : '') +
                         (event.shiftKey ? 'Shift' : '') +
                         event.key.toUpperCase();
  if (keyWithModifiers in keyboard_handler) {
    event.preventDefault();
    keyboard_handler[keyWithModifiers](event);
    return false;
  }

  if (event.key === 'F8') {
    if (document.activeElement && document.activeElement.classList.contains('node')) {
      console.log(compileStatements(document.activeElement));
    }
    return false;
  } else if (event.key === 'F9') {
    if (document.activeElement && document.activeElement.classList.contains('node')) {
      var compiledStatements = compileStatements(document.activeElement);
      var f = null;
      if (compiledStatements.indexOf('await') !== -1) {
        var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        f = new AsyncFunction([], compiledStatements);
      } else {
        f = new Function([], compiledStatements);
      }
      var returnValue = f();
      if (typeof returnValue !== 'undefined') {
        if (typeof returnValue.then === 'function') {
          returnValue.then(promisedValue => {
            if (typeof promisedValue === 'object') {
              document.activeElement.classList.remove('selected');
              makeJsonGraph(promisedValue, {x: parseInt(document.activeElement.style.left), y: parseInt(document.activeElement.style.top)});
            }
          });
        } else if (typeof returnValue === 'object') {
          document.activeElement.classList.remove('selected');
          makeJsonGraph(returnValue, {x: parseInt(document.activeElement.style.left), y: parseInt(document.activeElement.style.top)});
        }
      }
    }
    return false;
  }
});

document.addEventListener('keypress', event => {
  if ((!document.activeElement || document.activeElement.tagName !== 'INPUT') && event.key !== ' ') {
    var newNode = createNode({position: {x: pxToGridX(parseInt(cursor.style.left)), y: pxToGridY(parseInt(cursor.style.top))}});
    newNode.focus();
    selectionBox.classList.add('hidden');
    var createdElements = [newNode];
    if (linkBeingCreated) {
      var createdLink = useNodeForLinkCreationMode(newNode);
      if (createdLink) {
        createdElements.push(createdLink);
      }
    }
    recordAction(new createElementsAction(createdElements));
    return false;
  }
});