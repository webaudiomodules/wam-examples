function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

class AbstractItem {
  constructor(item) {
    _defineProperty(this, "type", void 0);

    _defineProperty(this, "label", void 0);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "index", void 0);

    _defineProperty(this, "init", void 0);

    _defineProperty(this, "min", void 0);

    _defineProperty(this, "max", void 0);

    _defineProperty(this, "meta", void 0);

    _defineProperty(this, "layout", void 0);

    Object.assign(this, item);
    this.min = isFinite(+this.min) ? +this.min : 0;
    this.max = isFinite(+this.max) ? +this.max : 1;
  }

  adjust() {
    return this;
  }

  expand(dX, dY) {
    return this;
  }

  offset() {
    return this;
  }

}

class AbstractInputItem extends AbstractItem {
  constructor(item) {
    super(item);

    _defineProperty(this, "init", void 0);

    _defineProperty(this, "step", void 0);

    this.init = +item.init || 0;
    this.step = +item.step || 1;
  }

}

class HSlider extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "hslider",
      width: 5,
      height: 1,
      sizing: "horizontal"
    });
  }

}

class VSlider extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "vslider",
      width: 1,
      height: 5,
      sizing: "vertical"
    });
  }

}

class Nentry extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "nentry",
      width: 1,
      height: 1,
      sizing: "none"
    });
  }

}

class Button extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "button",
      width: 2,
      height: 1,
      sizing: "horizontal"
    });
  }

}

class Checkbox extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "checkbox",
      width: 2,
      height: 1,
      sizing: "horizontal"
    });
  }

}

class Knob extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "knob",
      width: 1,
      height: 1.75,
      sizing: "none"
    });
  }

}

class Menu extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "menu",
      width: 2,
      height: 1,
      sizing: "horizontal"
    });
  }

}

class Radio extends AbstractInputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "radio",
      width: 2,
      height: 2,
      // TODO: vradio and hradio
      sizing: "both"
    });
  }

}

class AbstractOutputItem extends AbstractItem {}

class Led extends AbstractOutputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "led",
      width: 1,
      height: 1,
      sizing: "none"
    });
  }

}

class Numerical extends AbstractOutputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "numerical",
      width: 1,
      height: 1,
      sizing: "none"
    });
  }

}

class HBargraph extends AbstractOutputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "hbargraph",
      width: 5,
      height: 1,
      sizing: "horizontal"
    });
  }

}

class VBargraph extends AbstractOutputItem {
  constructor() {
    super(...arguments);

    _defineProperty(this, "layout", {
      type: "vbargraph",
      width: 1,
      height: 5,
      sizing: "vertical"
    });
  }

}

/* eslint-disable @typescript-eslint/no-unused-vars */
class AbstractGroup {
  constructor(group, isRoot) {
    _defineProperty(this, "isRoot", void 0);

    _defineProperty(this, "type", void 0);

    _defineProperty(this, "label", void 0);

    _defineProperty(this, "items", void 0);

    _defineProperty(this, "layout", void 0);

    this.isRoot = !!isRoot;
    Object.assign(this, group);
    const {
      hasHSizingDesc,
      hasVSizingDesc
    } = this;
    const sizing = hasHSizingDesc && hasVSizingDesc ? "both" : hasHSizingDesc ? "horizontal" : hasVSizingDesc ? "vertical" : "none";
    this.layout = {
      type: group.type,
      width: AbstractGroup.padding * 2,
      height: AbstractGroup.padding * 2 + AbstractGroup.labelHeight,
      sizing
    };
  }

  adjust() {
    return this;
  }

  expand(dX, dY) {
    return this;
  }

  offset() {
    return this;
  }
  /**
   * find recursively if the group has horizontal-sizable item
   *
   * @readonly
   * @type {boolean}
   * @memberof AbstractGroup
   */


  get hasHSizingDesc() {
    return !!this.items.find(item => {
      if (item instanceof AbstractGroup) return item.hasHSizingDesc;
      return item.layout.sizing === "horizontal" || item.layout.sizing === "both";
    });
  }
  /**
   * find recursively if the group has vertical-sizable item
   *
   * @readonly
   * @type {boolean}
   * @memberof AbstractGroup
   */


  get hasVSizingDesc() {
    return !!this.items.find(item => {
      if (item instanceof AbstractGroup) return item.hasVSizingDesc;
      return item.layout.sizing === "vertical" || item.layout.sizing === "both";
    });
  }

}

_defineProperty(AbstractGroup, "padding", 0.2);

_defineProperty(AbstractGroup, "labelHeight", 0.25);

_defineProperty(AbstractGroup, "spaceBetween", 0.1);

class HGroup extends AbstractGroup {
  adjust() {
    this.items.forEach(item => {
      item.adjust();
      this.layout.width += item.layout.width;
      this.layout.height = Math.max(this.layout.height, item.layout.height + 2 * AbstractGroup.padding + AbstractGroup.labelHeight);
    });
    this.layout.width += AbstractGroup.spaceBetween * (this.items.length - 1);
    if (this.layout.width < 1) this.layout.width += 1;
    return this;
  }

  expand(dX) {
    let hExpandItems = 0;
    this.items.forEach(item => {
      // Count items that need to expand horizontally
      if (item.layout.sizing === "both" || item.layout.sizing === "horizontal") hExpandItems++;
    });
    this.items.forEach(item => {
      let dX$ = 0;
      let dY$ = 0; // Space available to expand for current item

      if (item.layout.sizing === "both" || item.layout.sizing === "horizontal") {
        dX$ = hExpandItems ? dX / hExpandItems : 0;
        item.layout.width += dX$;
      }

      if (item.layout.sizing === "both" || item.layout.sizing === "vertical") {
        dY$ = this.layout.height - 2 * AbstractGroup.padding - AbstractGroup.labelHeight - item.layout.height;
        item.layout.height += dY$;
      }

      item.expand(dX$, dY$);
    });
    return this;
  }

  offset() {
    const {
      labelHeight,
      padding,
      spaceBetween
    } = AbstractGroup;
    let $left = padding;
    const $top = padding + labelHeight;
    const {
      height
    } = this.layout;
    this.items.forEach(item => {
      item.layout.offsetLeft = $left;
      item.layout.offsetTop = $top; // center the item

      item.layout.offsetTop += (height - labelHeight - item.layout.height) / 2 - padding;
      item.layout.left = (this.layout.left || 0) + item.layout.offsetLeft;
      item.layout.top = (this.layout.top || 0) + item.layout.offsetTop;
      item.offset();
      $left += item.layout.width + spaceBetween;
    });
    return this;
  }

}

class VGroup extends AbstractGroup {
  adjust() {
    this.items.forEach(item => {
      item.adjust();
      this.layout.width = Math.max(this.layout.width, item.layout.width + 2 * AbstractGroup.padding);
      this.layout.height += item.layout.height;
    });
    this.layout.height += AbstractGroup.spaceBetween * (this.items.length - 1);
    if (this.layout.width < 1) this.layout.width += 1;
    return this;
  }

  expand(dX, dY) {
    let vExpandItems = 0;
    this.items.forEach(item => {
      if (item.layout.sizing === "both" || item.layout.sizing === "vertical") vExpandItems++;
    });
    this.items.forEach(item => {
      let dX$ = 0;
      let dY$ = 0; // Space available to expand for current item

      if (item.layout.sizing === "both" || item.layout.sizing === "horizontal") {
        dX$ = this.layout.width - 2 * AbstractGroup.padding - item.layout.width;
        item.layout.width += dX$;
      }

      if (item.layout.sizing === "both" || item.layout.sizing === "vertical") {
        dY$ = vExpandItems ? dY / vExpandItems : 0;
        item.layout.height += dY$;
      }

      item.expand(dX$, dY$);
    });
    return this;
  }

  offset() {
    const {
      labelHeight,
      padding,
      spaceBetween
    } = AbstractGroup;
    const $left = padding;
    let $top = padding + labelHeight;
    const {
      width
    } = this.layout;
    this.items.forEach(item => {
      item.layout.offsetLeft = $left;
      item.layout.offsetTop = $top; // center the item

      item.layout.offsetLeft += (width - item.layout.width) / 2 - padding;
      item.layout.left = (this.layout.left || 0) + item.layout.offsetLeft;
      item.layout.top = (this.layout.top || 0) + item.layout.offsetTop;
      item.offset();
      $top += item.layout.height + spaceBetween;
    });
    return this;
  }

}

class TGroup extends AbstractGroup {
  adjust() {
    this.items.forEach(item => {
      item.adjust();
      this.layout.width = Math.max(this.layout.width, item.layout.width + 2 * AbstractGroup.padding);
      this.layout.height = Math.max(this.layout.height, item.layout.height + 2 * AbstractGroup.padding + TGroup.labelHeight);
    });
    const tabsCount = this.items.length;
    this.layout.width = Math.max(this.layout.width, tabsCount * TGroup.tabLayout.width + 2 * TGroup.padding);
    this.layout.height += TGroup.tabLayout.height;
    if (this.layout.width < 1) this.layout.width += 1;
    return this;
  }

  expand() {
    const tabsCount = this.items.length;
    this.items.forEach(item => {
      let dY$ = 0; // Space available to expand for current item

      let dX$ = 0;
      if (item.layout.sizing === "both" || item.layout.sizing === "horizontal") dX$ = this.layout.width - 2 * AbstractGroup.padding - item.layout.width;
      if (item.layout.sizing === "both" || item.layout.sizing === "vertical") dY$ = this.layout.height - 2 * AbstractGroup.padding - AbstractGroup.labelHeight - (tabsCount ? TGroup.tabLayout.height : 0) - item.layout.height;
      item.expand(dX$, dY$);
    });
    return this;
  }

  offset() {
    const {
      labelHeight,
      padding
    } = AbstractGroup;
    const $left = padding;
    const $top = padding + labelHeight + TGroup.tabLayout.height;
    this.items.forEach(item => {
      item.layout.offsetLeft = $left;
      item.layout.offsetTop = $top;
      item.layout.left = (this.layout.left || 0) + item.layout.offsetLeft;
      item.layout.top = (this.layout.top || 0) + item.layout.offsetTop;
      item.offset();
    });
    return this;
  }

}

_defineProperty(TGroup, "tabLayout", {
  width: 2,
  height: 1
});

class Layout {
  /**
   * Get the rendering type of an item by parsing its metadata
   *
   * @static
   * @param {TFaustUIItem} item
   * @returns {TLayoutType}
   * @memberof Layout
   */
  static predictType(item) {
    if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup" || item.type === "button" || item.type === "checkbox") return item.type;

    if (item.type === "hbargraph" || item.type === "vbargraph") {
      if (item.meta && item.meta.find(meta => meta.style && meta.style.startsWith("led"))) return "led";
      if (item.meta && item.meta.find(meta => meta.style && meta.style.startsWith("numerical"))) return "numerical";
      return item.type;
    }

    if (item.type === "hslider" || item.type === "nentry" || item.type === "vslider") {
      if (item.meta && item.meta.find(meta => meta.style && meta.style.startsWith("knob"))) return "knob";
      if (item.meta && item.meta.find(meta => meta.style && meta.style.startsWith("menu"))) return "menu";
      if (item.meta && item.meta.find(meta => meta.style && meta.style.startsWith("radio"))) return "radio";
    }

    return item.type;
  }
  /**
   * Get the Layout class constructor of an item
   */


  static getItem(item) {
    const ctor = {
      hslider: HSlider,
      vslider: VSlider,
      nentry: Nentry,
      button: Button,
      checkbox: Checkbox,
      knob: Knob,
      menu: Menu,
      radio: Radio,
      led: Led,
      numerical: Numerical,
      hbargraph: HBargraph,
      vbargraph: VBargraph,
      hgroup: HGroup,
      vgroup: VGroup,
      tgroup: TGroup
    };
    const layoutType = this.predictType(item);
    return new ctor[layoutType](item);
  }

  static getItems(items) {
    return items.map(item => {
      if ("items" in item) item.items = this.getItems(item.items);
      return this.getItem(item);
    });
  }

  static calc(ui) {
    const rootGroup = new VGroup({
      items: this.getItems(ui),
      type: "vgroup",
      label: ""
    }, true);
    rootGroup.adjust();
    rootGroup.expand(0, 0);
    rootGroup.offset();
    return rootGroup;
  }

}

// Copyright Joyent, Inc. and other Node contributors.

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}
var events = EventEmitter;
var once_1 = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}
events.once = once_1;

class TypedEventEmitter {
  constructor() {
    _defineProperty(this, "_listeners", {});
  }

  get listeners() {
    return this._listeners;
  }

  getListeners(eventName) {
    if (!(eventName in this._listeners)) this._listeners[eventName] = [];
    return this._listeners[eventName];
  }

  on(eventName, listener) {
    if (this.getListeners(eventName).indexOf(listener) === -1) this.getListeners(eventName).push(listener);
  }

  off(eventName, listener) {
    const i = this.getListeners(eventName).indexOf(listener);
    if (i !== -1) this.getListeners(eventName).splice(i, 1);
  }

  async emit(eventName, eventData) {
    const listeners = this.getListeners(eventName);
    if (!listeners) return [];
    return Promise.all(listeners.map(f => f(eventData)));
  }

  async emitSerial(eventName, eventData) {
    const listeners = this.getListeners(eventName);
    if (!listeners) return;
    /* eslint-disable no-await-in-loop */

    for (const listener of listeners) {
      await listener(eventData);
    }
  }

  emitSync(eventName, eventData) {
    const listeners = this.getListeners(eventName);
    if (!listeners) return;
    listeners.map(f => f(eventData));
  }

  removeAllListeners(eventName) {
    if (eventName) {
      this._listeners[eventName] = [];
    } else {
      this._listeners = {};
    }
  }

  listenerCount(eventName) {
    if (!(eventName in this._listeners)) return 0;
    return this._listeners[eventName].length;
  }

}

class AbstractComponent extends TypedEventEmitter {
  /**
   * The default state of the component.
   */
  get defaultProps() {
    return this.constructor.defaultProps;
  }
  /**
   * Here stores corrent state of component
   * change the state with `setState` method to fire state events
   * then UI parts will get notified and rerender
   */


  /**
   * Initiate default state with incoming state.
   */
  constructor(props) {
    super();

    _defineProperty(this, "state", void 0);

    _defineProperty(this, "$frame", 0);

    _defineProperty(this, "frameReduce", 1);

    _defineProperty(this, "$raf", void 0);

    _defineProperty(this, "raf", () => {
      this.$frame++;

      if (this.$frame % this.frameReduce !== 0) {
        this.$raf = window.requestAnimationFrame(this.raf);
        return;
      }

      this.$raf = undefined;
      this.tasks.forEach(f => f());
      this.tasks = [];
    });

    _defineProperty(this, "tasks", []);

    this.state = _objectSpread2(_objectSpread2({}, this.defaultProps), props);
    return this;
  }
  /**
   * set internal state and fire events for UI parts subscribed
   */


  setState(newState) {
    let shouldUpdate = false;

    for (const stateKey in newState) {
      const stateValue = newState[stateKey];

      if (stateKey in this.state && this.state[stateKey] !== stateValue) {
        this.state[stateKey] = stateValue;
        shouldUpdate = true;
      } else return;

      if (shouldUpdate) this.emit(stateKey, this.state[stateKey]);
    }
  }
  /**
   * Use this method to request a new rendering
   * schedule what you need to do in next render tick in `raf` callback
   */


  schedule(func) {
    if (this.tasks.indexOf(func) === -1) this.tasks.push(func);
    if (this.$raf) return;
    this.$raf = window.requestAnimationFrame(this.raf);
  }

}

_defineProperty(AbstractComponent, "defaultProps", {});

const toRad = degrees => degrees * Math.PI / 180;
const normLog = x => Math.log10(x * 99 + 1) / 2 || 0;
const normExp = x => (10 ** (2 * x) - 1) / 99;
const fillRoundedRect = (ctx, x, y, width, height, radius) => {
  const radii = [0, 0, 0, 0];
  if (typeof radius === "number") radii.fill(radius);else radius.forEach((v, i) => radii[i] = v);
  ctx.beginPath();
  ctx.moveTo(x + radii[0], y);
  ctx.lineTo(x + width - radii[1], y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radii[1]);
  ctx.lineTo(x + width, y + height - radii[2]);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radii[2], y + height);
  ctx.lineTo(x + radii[3], y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radii[3]);
  ctx.lineTo(x, y + radii[0]);
  ctx.quadraticCurveTo(x, y, x + radii[0], y);
  ctx.closePath();
  ctx.fill();
};

/**
 * Abstract class that describes a FaustUI Component
 * this is an event emitter that emits every state change to inform UI renderer parts
 * Each UI parts could subscribe to a specific state such as `value`, `min`, `max` or `style`
 * when the event subscribed is fired, this part of ui updated using its own handler without updating the rest of UI parts
 * the types of events is restricted to the same as keys of `state` object:
 * `state` object is a `FaustUIItemProps` with a `style` object that contains `T` defined by child class.
 * Child class can override life cycle methods
 * `componentWillMount` prepare data before DOM get loads to page
 * `mount` get DOMs append to page
 * `componentDidMount` Now draw canvas etc.
 */

class AbstractItem$1 extends AbstractComponent {
  /**
   * The default state of the component.
   */

  /**
   * DOM Div container of the component
   */

  /**
   * DOM Div container of label canvas
   */

  /**
   * Use canvas as label to fit full text in.
   */

  /**
   * Override this to get css work
   */

  /**
   * Default DOM event listeners, unify mousedown and touchstart events
   * For mouse or touch events, please use `handlePointerDown` `handlePointerUp` `handlePointerDrag` callbacks
   */

  /**
   * Initiate default state with incoming state.
   */
  constructor(props) {
    super(props);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "label", void 0);

    _defineProperty(this, "labelCanvas", void 0);

    _defineProperty(this, "labelCtx", void 0);

    _defineProperty(this, "className", void 0);

    _defineProperty(this, "frameReduce", 3);

    _defineProperty(this, "handleKeyDown", e => {});

    _defineProperty(this, "handleKeyUp", e => {});

    _defineProperty(this, "handleTouchStart", e => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      let prevX = e.touches[0].pageX;
      let prevY = e.touches[0].pageY;
      const fromX = prevX - rect.left;
      const fromY = prevY - rect.top;
      const prevValue = this.state.value;
      this.handlePointerDown({
        x: fromX,
        y: fromY,
        originalEvent: e
      });

      const handleTouchMove = e => {
        e.preventDefault();
        const pageX = e.changedTouches[0].pageX;
        const pageY = e.changedTouches[0].pageY;
        const movementX = pageX - prevX;
        const movementY = pageY - prevY;
        prevX = pageX;
        prevY = pageY;
        const x = pageX - rect.left;
        const y = pageY - rect.top;
        this.handlePointerDrag({
          prevValue,
          x,
          y,
          fromX,
          fromY,
          movementX,
          movementY,
          originalEvent: e
        });
      };

      const handleTouchEnd = e => {
        e.preventDefault();
        const x = e.changedTouches[0].pageX - rect.left;
        const y = e.changedTouches[0].pageY - rect.top;
        this.handlePointerUp({
          x,
          y,
          originalEvent: e
        });
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove, {
        passive: false
      });
      document.addEventListener("touchend", handleTouchEnd, {
        passive: false
      });
    });

    _defineProperty(this, "handleWheel", e => {});

    _defineProperty(this, "handleClick", e => {});

    _defineProperty(this, "handleMouseDown", e => {
      e.preventDefault();
      e.currentTarget.focus();
      const rect = e.currentTarget.getBoundingClientRect();
      const fromX = e.pageX - rect.left;
      const fromY = e.pageY - rect.top;
      const prevValue = this.state.value;
      this.handlePointerDown({
        x: fromX,
        y: fromY,
        originalEvent: e
      });

      const handleMouseMove = e => {
        e.preventDefault();
        const x = e.pageX - rect.left;
        const y = e.pageY - rect.top;
        this.handlePointerDrag({
          prevValue,
          x,
          y,
          fromX,
          fromY,
          movementX: e.movementX,
          movementY: e.movementY,
          originalEvent: e
        });
      };

      const handleMouseUp = e => {
        e.preventDefault();
        const x = e.pageX - rect.left;
        const y = e.pageY - rect.top;
        this.handlePointerUp({
          x,
          y,
          originalEvent: e
        });
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });

    _defineProperty(this, "handleMouseOver", e => {});

    _defineProperty(this, "handleMouseOut", e => {});

    _defineProperty(this, "handleContextMenu", e => {});

    _defineProperty(this, "handlePointerDown", e => {});

    _defineProperty(this, "handlePointerDrag", e => {});

    _defineProperty(this, "handlePointerUp", e => {});

    _defineProperty(this, "handleFocusIn", e => this.setState({
      focus: true
    }));

    _defineProperty(this, "handleFocusOut", e => this.setState({
      focus: false
    }));

    this.state.style = _objectSpread2(_objectSpread2({}, this.defaultProps.style), props.style);
    if (this.state.emitter) this.state.emitter.register(this.state.address, this);
    return this;
  }
  /**
   * Get a nearest valid number
   */


  toValidNumber(value) {
    const {
      min,
      max,
      step
    } = this.state;
    if (typeof min !== "number" || typeof max !== "number") return value;
    const v = Math.min(max, Math.max(min, value));
    if (!step) return v;
    return min + Math.floor((v - min) / step) * step;
  }
  /**
   * Use this method if you want the emitter to send value to DSP
   */


  setValue(valueIn) {
    const value = this.toValidNumber(valueIn);
    const changed = this.setState({
      value
    });
    if (changed) this.change(value);
    return changed;
  }
  /**
   * Send value to DSP
   */


  change(valueIn) {
    if (this.state.emitter) this.state.emitter.paramChangeByUI(this.state.address, typeof valueIn === "number" ? valueIn : this.state.value);
  }
  /**
   * set internal state and fire events for UI parts subscribed
   * This will not send anything to DSP
   */


  setState(newState) {
    let shouldUpdate = false;

    for (const key in newState) {
      const stateKey = key;
      const stateValue = newState[stateKey];

      if (stateKey === "style") {
        for (const styleKey in newState.style) {
          if (styleKey in this.state.style && this.state.style[styleKey] !== newState.style[styleKey]) {
            this.state.style[styleKey] = newState.style[styleKey];
            shouldUpdate = true;
          }
        }
      } else if (stateKey in this.state && this.state[stateKey] !== stateValue) {
        this.state[stateKey] = stateValue;
        shouldUpdate = true;
      } else return false;

      if (shouldUpdate) this.emit(stateKey, this.state[stateKey]);
    }

    return shouldUpdate;
  }
  /**
   * Create container with class name
   * override it with `super.componentWillMount();`
   */


  componentWillMount() {
    this.container = document.createElement("div");
    this.container.className = ["faust-ui-component", "faust-ui-component-" + this.className].join(" ");
    this.container.tabIndex = 1;
    this.container.id = this.state.address;
    if (this.state.tooltip) this.container.title = this.state.tooltip;
    this.label = document.createElement("div");
    this.label.className = "faust-ui-component-label";
    this.labelCanvas = document.createElement("canvas");
    this.labelCtx = this.labelCanvas.getContext("2d");
    return this;
  }
  /**
   * Here append all child DOM to container
   */


  mount() {
    this.label.appendChild(this.labelCanvas);
    return this;
  }

  paintLabel(align) {
    const label = this.state.label;
    const color = this.state.style.labelcolor;
    const ctx = this.labelCtx;
    const canvas = this.labelCanvas;
    let {
      width,
      height
    } = this.label.getBoundingClientRect();
    if (!width || !height) return this;
    width = Math.floor(width);
    height = Math.floor(height);
    canvas.height = height;
    canvas.width = width;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = align || "center";
    ctx.font = "bold ".concat(height * 0.9, "px -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"");
    ctx.fillText(label, align === "left" ? 0 : align === "right" ? width : width / 2, height / 2, width);
    return this;
  }
  /**
   * will call this method when mounted
   */


  componentDidMount() {
    const handleResize = () => {
      const {
        grid,
        left,
        top,
        width,
        height
      } = this.state.style;
      this.container.style.width = "".concat(width * grid, "px");
      this.container.style.height = "".concat(height * grid, "px");
      this.container.style.left = "".concat(left * grid, "px");
      this.container.style.top = "".concat(top * grid, "px");
      this.label.style.height = "".concat(grid * 0.25, "px");
      this.paintLabel();
    };

    this.on("style", () => this.schedule(handleResize));
    handleResize();
    return this;
  }
  /**
   * Count steps in range min-max with step
   */


  get stepsCount() {
    const {
      type,
      max,
      min,
      step,
      enums
    } = this.state;
    const maxSteps = type === "enum" ? enums.length : type === "int" ? max - min : (max - min) / step;

    if (step) {
      if (type === "enum") return enums.length;
      if (type === "int") return Math.min(Math.floor((max - min) / (Math.round(step) || 1)), maxSteps);
      return Math.floor((max - min) / step);
    }

    return maxSteps;
  }
  /**
   * Normalized value between 0 - 1.
   */


  get distance() {
    const {
      type,
      max,
      min,
      value,
      enums,
      scale
    } = this.state;
    return AbstractItem$1.getDistance({
      type,
      max,
      min,
      value,
      enums,
      scale
    });
  }

  static getDistance(state) {
    const {
      type,
      max,
      min,
      value,
      enums,
      scale
    } = state;
    const normalized = type === "enum" ? value / (enums.length - 1) : (value - min) / (max - min);
    return scale === "exp" ? normLog(normalized) : scale === "log" ? normExp(normalized) : normalized;
  }
  /**
   * Mousemove pixels for each step
   */


  get stepRange() {
    const full = 100;
    const stepsCount = this.stepsCount;
    return full / stepsCount;
  }

}

_defineProperty(AbstractItem$1, "defaultProps", {
  value: 0,
  active: true,
  focus: false,
  label: "",
  address: "",
  min: 0,
  max: 1,
  enums: {},
  type: "float",
  unit: "",
  scale: "linear",
  step: 0.01,
  style: {
    width: 45,
    height: 15,
    left: 0,
    top: 0,
    labelcolor: "rgba(226, 222, 255, 0.5)"
  }
});

class VSlider$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "vslider");

    _defineProperty(this, "canvas", void 0);

    _defineProperty(this, "inputNumber", void 0);

    _defineProperty(this, "input", void 0);

    _defineProperty(this, "flexDiv", void 0);

    _defineProperty(this, "canvasDiv", void 0);

    _defineProperty(this, "ctx", void 0);

    _defineProperty(this, "interactionRect", [0, 0, 0, 0]);

    _defineProperty(this, "handleChange", e => {
      const value = parseFloat(e.currentTarget.value);

      if (isFinite(value)) {
        const changed = this.setValue(+value);
        if (changed) return;
      }

      this.input.value = this.inputNumber.value + (this.state.unit || "");
    });

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        width,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      const fontSize = Math.min(height * grid * 0.05, width * grid * 0.2);
      this.input.style.fontSize = "".concat(fontsize || fontSize, "px");
      this.input.style.color = textcolor;
      this.container.style.backgroundColor = bgcolor;
      this.container.style.borderColor = bordercolor;
    });

    _defineProperty(this, "paint", () => {
      const {
        sliderwidth,
        sliderbgcolor,
        sliderbgoncolor,
        slidercolor
      } = this.state.style;
      const ctx = this.ctx;
      const canvas = this.canvas;
      const distance = this.distance;
      let {
        width,
        height
      } = this.canvasDiv.getBoundingClientRect();
      width = Math.floor(width);
      height = Math.floor(height);
      canvas.width = width;
      canvas.height = height;
      const drawHeight = height * 0.9;
      const drawWidth = sliderwidth || Math.min(width / 3, drawHeight * 0.05);
      const left = (width - drawWidth) * 0.5;
      const top = height * 0.05;
      const borderRadius = drawWidth * 0.25;
      this.interactionRect = [0, top, width, drawHeight];
      const grd = ctx.createLinearGradient(0, top, 0, top + drawHeight);
      grd.addColorStop(Math.max(0, Math.min(1, 1 - distance)), sliderbgcolor);
      grd.addColorStop(Math.max(0, Math.min(1, 1 - distance)), sliderbgoncolor);
      ctx.fillStyle = grd;
      fillRoundedRect(ctx, left, top, drawWidth, drawHeight, borderRadius); // draw slider

      ctx.fillStyle = slidercolor;
      fillRoundedRect(ctx, left - drawWidth, top + drawHeight * (1 - distance) - drawWidth, drawWidth * 3, drawWidth * 2, borderRadius);
    });

    _defineProperty(this, "handlePointerDown", e => {
      const {
        value
      } = this.state;
      if (e.x < this.interactionRect[0] || e.x > this.interactionRect[0] + this.interactionRect[2] || e.y < this.interactionRect[1] || e.y > this.interactionRect[1] + this.interactionRect[3]) return;
      const newValue = this.getValueFromPos(e);
      if (newValue !== value) this.setValue(this.getValueFromPos(e));
    });

    _defineProperty(this, "handlePointerDrag", e => {
      const newValue = this.getValueFromPos(e);
      if (newValue !== this.state.value) this.setValue(newValue);
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(18, 18, 18, 0)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)",
        sliderwidth: undefined,
        sliderbgcolor: "rgba(18, 18, 18, 1)",
        sliderbgoncolor: "rgba(255, 165, 0, 1)",
        slidercolor: "rgba(200, 200, 200, 0.75)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.flexDiv = document.createElement("div");
    this.flexDiv.className = "faust-ui-component-".concat(this.className, "-flexdiv");
    this.canvasDiv = document.createElement("div");
    this.canvasDiv.className = "faust-ui-component-".concat(this.className, "-canvasdiv");
    this.canvas = document.createElement("canvas");
    this.canvas.width = 10;
    this.canvas.height = 10;
    this.ctx = this.canvas.getContext("2d");
    this.inputNumber = document.createElement("input");
    this.inputNumber.type = "number";
    this.inputNumber.value = (+this.state.value.toFixed(3)).toString();
    this.inputNumber.max = this.state.max.toString();
    this.inputNumber.min = this.state.min.toString();
    this.inputNumber.step = this.state.step.toString();
    this.input = document.createElement("input");
    this.input.value = this.inputNumber.value + (this.state.unit || "");
    this.input.spellcheck = false;
    this.setStyle();
    return this;
  }

  componentDidMount() {
    super.componentDidMount();
    this.input.addEventListener("change", this.handleChange);
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false
    });
    this.on("style", () => {
      this.schedule(this.setStyle);
      this.schedule(this.paint);
    });
    this.on("label", () => this.schedule(this.paintLabel));

    const valueChange = () => {
      this.inputNumber.value = (+this.state.value.toFixed(3)).toString();
      this.input.value = this.inputNumber.value + (this.state.unit || "");
    };

    this.on("value", () => {
      this.schedule(valueChange);
      this.schedule(this.paint);
    });

    const maxChange = () => this.inputNumber.max = this.state.max.toString();

    this.on("max", () => {
      this.schedule(maxChange);
      this.schedule(this.paint);
    });

    const minChange = () => this.inputNumber.min = this.state.min.toString();

    this.on("min", () => {
      this.schedule(minChange);
      this.schedule(this.paint);
    });

    const stepChange = () => this.inputNumber.step = this.state.step.toString();

    this.on("step", () => {
      this.schedule(stepChange);
      this.schedule(this.paint);
    });
    this.schedule(this.paint);
    return this;
  }

  mount() {
    this.canvasDiv.appendChild(this.canvas);
    this.flexDiv.appendChild(this.canvasDiv);
    this.flexDiv.appendChild(this.input);
    this.container.appendChild(this.label);
    this.container.appendChild(this.flexDiv);
    return super.mount();
  }

  get stepsCount() {
    const {
      type,
      max,
      min,
      step,
      enums
    } = this.state;
    const maxSteps = type === "enum" ? enums.length : type === "int" ? max - min : (max - min) / step;

    if (step) {
      if (type === "enum") return enums.length;
      if (type === "int") return Math.min(Math.floor((max - min) / (Math.round(step) || 0)), maxSteps);
      return Math.floor((max - min) / step);
    }

    return maxSteps;
  }

  get stepRange() {
    const full = this.interactionRect[this.className === "vslider" ? 3 : 2];
    const stepsCount = this.stepsCount;
    return full / stepsCount;
  }

  getValueFromPos(e) {
    const {
      type,
      min,
      scale
    } = this.state;
    const step = type === "enum" ? 1 : this.state.step || 1;
    const stepRange = this.stepRange;
    const stepsCount = this.stepsCount;
    const distance = this.className === "vslider" ? this.interactionRect[3] - (e.y - this.interactionRect[1]) : e.x - this.interactionRect[0];
    const range = this.className === "vslider" ? this.interactionRect[3] : this.interactionRect[2];
    let steps = Math.round((scale === "exp" ? normExp(distance / range) : scale === "log" ? normLog(distance / range) : distance / range) * range / stepRange);
    steps = Math.min(stepsCount, Math.max(0, steps));
    if (type === "enum") return steps;
    if (type === "int") return Math.round(steps * step + min);
    return steps * step + min;
  }

}

class HSlider$1 extends VSlider$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "hslider");

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      this.input.style.fontSize = "".concat(fontsize || height * grid * 0.2, "px");
      this.input.style.color = textcolor;
      this.container.style.backgroundColor = bgcolor;
      this.container.style.borderColor = bordercolor;
    });

    _defineProperty(this, "paint", () => {
      const {
        sliderwidth,
        sliderbgcolor,
        sliderbgoncolor,
        slidercolor
      } = this.state.style;
      const ctx = this.ctx;
      const canvas = this.canvas;
      const distance = this.distance;
      let {
        width,
        height
      } = this.canvasDiv.getBoundingClientRect();
      width = Math.floor(width);
      height = Math.floor(height);
      canvas.width = width;
      canvas.height = height;
      const drawWidth = width * 0.9;
      const drawHeight = sliderwidth || Math.min(height / 3, drawWidth * 0.05);
      const left = width * 0.05;
      const top = (height - drawHeight) * 0.5;
      const borderRadius = drawHeight * 0.25;
      this.interactionRect = [left, 0, drawWidth, height];
      const grd = ctx.createLinearGradient(left, 0, left + drawWidth, 0);
      grd.addColorStop(Math.max(0, Math.min(1, distance)), sliderbgoncolor);
      grd.addColorStop(Math.max(0, Math.min(1, distance)), sliderbgcolor);
      ctx.fillStyle = grd;
      fillRoundedRect(ctx, left, top, drawWidth, drawHeight, borderRadius); // draw slider

      ctx.fillStyle = slidercolor;
      fillRoundedRect(ctx, left + drawWidth * distance - drawHeight, top - drawHeight, drawHeight * 2, drawHeight * 3, borderRadius);
    });
  }

  paintLabel() {
    return super.paintLabel("left");
  }

}

class Nentry$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "nentry");

    _defineProperty(this, "input", void 0);

    _defineProperty(this, "handleChange", e => {
      this.setValue(+e.currentTarget.value);
    });

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      this.input.style.backgroundColor = bgcolor;
      this.input.style.borderColor = bordercolor;
      this.input.style.color = textcolor;
      this.input.style.fontSize = "".concat(fontsize || height * grid / 4, "px");
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(255, 255, 255, 0.25)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.input = document.createElement("input");
    this.input.type = "number";
    this.input.value = (+this.state.value.toFixed(3)).toString();
    this.input.max = this.state.max.toString();
    this.input.min = this.state.min.toString();
    this.input.step = this.state.step.toString();
    this.setStyle();
    return this;
  }

  componentDidMount() {
    super.componentDidMount();
    this.input.addEventListener("change", this.handleChange);
    this.on("style", () => this.schedule(this.setStyle));
    this.on("label", () => this.schedule(this.paintLabel));

    const valueChange = () => this.input.value = (+this.state.value.toFixed(3)).toString();

    this.on("value", () => this.schedule(valueChange));

    const maxChange = () => this.input.max = this.state.max.toString();

    this.on("max", () => this.schedule(maxChange));

    const minChange = () => this.input.min = this.state.min.toString();

    this.on("min", () => this.schedule(minChange));

    const stepChange = () => this.input.step = this.state.step.toString();

    this.on("step", () => this.schedule(stepChange));
    return this;
  }

  mount() {
    this.container.appendChild(this.label);
    this.container.appendChild(this.input);
    return super.mount();
  }

}

class Button$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "button");

    _defineProperty(this, "btn", void 0);

    _defineProperty(this, "span", void 0);

    _defineProperty(this, "setStyle", () => {
      const {
        value,
        style
      } = this.state;
      const {
        height,
        grid,
        fontsize,
        fontname,
        fontface,
        textcolor,
        textoncolor,
        bgoncolor,
        bgcolor,
        bordercolor,
        borderoncolor
      } = style;
      this.btn.style.backgroundColor = value ? bgoncolor : bgcolor;
      this.btn.style.borderColor = value ? borderoncolor : bordercolor;
      this.btn.style.color = value ? textoncolor : textcolor;
      this.btn.style.fontSize = "".concat(fontsize || height * grid / 4, "px");
      this.btn.style.fontFamily = "".concat(fontname, ", sans-serif");
      this.btn.style.fontStyle = fontface;
    });

    _defineProperty(this, "handlePointerDown", () => {
      this.setValue(1);
    });

    _defineProperty(this, "handlePointerUp", () => {
      this.setValue(0);
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "normal",
        bgcolor: "rgba(40, 40, 40, 1)",
        bgoncolor: "rgba(18, 18, 18, 1)",
        bordercolor: "rgba(80, 80, 80, 1)",
        borderoncolor: "rgba(255, 165, 0, 1)",
        textcolor: "rgba(226, 222, 255, 0.5)",
        textoncolor: "rgba(255, 165, 0, 1)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.btn = document.createElement("div");
    this.span = document.createElement("span");
    this.span.innerText = this.state.label;
    this.setStyle();
    return this;
  }

  mount() {
    this.btn.appendChild(this.span);
    this.container.appendChild(this.btn);
    return super.mount();
  }

  componentDidMount() {
    super.componentDidMount();
    this.btn.addEventListener("mousedown", this.handleMouseDown);
    this.btn.addEventListener("touchstart", this.handleTouchStart);
    this.on("style", () => this.schedule(this.setStyle));

    const labelChange = () => this.span.innerText = this.state.label;

    this.on("label", () => this.schedule(labelChange));
    this.on("value", () => this.schedule(this.setStyle));
    return this;
  }

}

class Checkbox$1 extends Button$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "checkbox");

    _defineProperty(this, "handlePointerDown", () => {
      this.setValue(1 - this.state.value);
    });

    _defineProperty(this, "handlePointerUp", () => {});
  }

}

class Knob$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "knob");

    _defineProperty(this, "canvas", void 0);

    _defineProperty(this, "inputNumber", void 0);

    _defineProperty(this, "input", void 0);

    _defineProperty(this, "ctx", void 0);

    _defineProperty(this, "handleChange", e => {
      const value = parseFloat(e.currentTarget.value);

      if (isFinite(value)) {
        const changed = this.setValue(+this.inputNumber.value);
        if (changed) return;
      }

      this.input.value = this.inputNumber.value + (this.state.unit || "");
    });

    _defineProperty(this, "setStyle", () => {
      const {
        fontsize,
        height,
        grid,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      this.input.style.fontSize = "".concat(fontsize || height * grid * 0.1, "px");
      this.input.style.color = textcolor;
      this.container.style.backgroundColor = bgcolor;
      this.container.style.borderColor = bordercolor;
    });

    _defineProperty(this, "paint", () => {
      const {
        knobwidth,
        knobcolor,
        knoboncolor,
        needlecolor
      } = this.state.style;
      const ctx = this.ctx;
      const canvas = this.canvas;
      const distance = this.distance;
      let {
        width,
        height
      } = this.canvas.getBoundingClientRect();
      width = Math.floor(width);
      height = Math.floor(height);
      canvas.width = width;
      canvas.height = height;
      const start = 5 / 8 * Math.PI;
      const end = 19 / 8 * Math.PI;
      const valPos = start + toRad(distance * 315);
      const dialHeight = Math.min(width, height) * 0.75;
      const dialRadius = dialHeight * 0.5;
      const dialCenterX = width * 0.5;
      const dialCenterY = height * 0.5; // const arcStartX = dialCenterX + (dialHeight * 0.5 * Math.cos(start));
      // const arcStartY = dialCenterY + (dialHeight * 0.5 * Math.sin(start));
      // const arcEndX = dialCenterX + (dialHeight * 0.5 * Math.cos(end));
      // const arcEndY = dialCenterY + (dialHeight * 0.5 * Math.sin(end));

      const valuePosX = dialCenterX + dialHeight * 0.5 * Math.cos(valPos);
      const valuePosY = dialCenterY + dialHeight * 0.5 * Math.sin(valPos);
      const lineWidth = knobwidth || dialRadius * 0.2;
      ctx.strokeStyle = knobcolor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round"; // draw background arc

      ctx.beginPath();
      ctx.arc(dialCenterX, dialCenterY, dialRadius, valPos, end);
      ctx.stroke(); // draw value arc

      if (distance) {
        ctx.strokeStyle = knoboncolor;
        ctx.beginPath();
        ctx.arc(dialCenterX, dialCenterY, dialRadius, start, valPos);
        ctx.stroke();
      } // draw dial needle


      ctx.strokeStyle = needlecolor;
      ctx.beginPath();
      ctx.moveTo(dialCenterX, dialCenterY);
      ctx.lineTo(valuePosX, valuePosY);
      ctx.stroke();
    });

    _defineProperty(this, "handlePointerDrag", e => {
      const newValue = this.getValueFromDelta(e);
      if (newValue !== this.state.value) this.setValue(newValue);
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(18, 18, 18, 0)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)",
        knobwidth: undefined,
        knobcolor: "rgba(18, 18, 18, 1)",
        knoboncolor: "rgba(255, 165, 0, 1)",
        needlecolor: "rgba(200, 200, 200, 0.75)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.canvas = document.createElement("canvas");
    this.canvas.width = 10;
    this.canvas.height = 10;
    this.ctx = this.canvas.getContext("2d");
    this.inputNumber = document.createElement("input");
    this.inputNumber.type = "number";
    this.inputNumber.value = (+this.state.value.toFixed(3)).toString();
    this.inputNumber.max = this.state.max.toString();
    this.inputNumber.min = this.state.min.toString();
    this.inputNumber.step = this.state.step.toString();
    this.input = document.createElement("input");
    this.input.value = this.inputNumber.value + (this.state.unit || "");
    this.input.spellcheck = false;
    this.setStyle();
    return this;
  }

  componentDidMount() {
    super.componentDidMount();
    this.input.addEventListener("change", this.handleChange);
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false
    });
    this.on("style", () => {
      this.schedule(this.setStyle);
      this.schedule(this.paint);
    });
    this.on("label", () => this.schedule(this.paintLabel));

    const valueChange = () => {
      this.inputNumber.value = (+this.state.value.toFixed(3)).toString();
      this.input.value = this.inputNumber.value + (this.state.unit || "");
    };

    this.on("value", () => {
      this.schedule(valueChange);
      this.schedule(this.paint);
    });

    const maxChange = () => this.inputNumber.max = this.state.max.toString();

    this.on("max", () => {
      this.schedule(maxChange);
      this.schedule(this.paint);
    });

    const minChange = () => this.inputNumber.min = this.state.min.toString();

    this.on("min", () => {
      this.schedule(minChange);
      this.schedule(this.paint);
    });

    const stepChange = () => this.inputNumber.step = this.state.step.toString();

    this.on("step", () => {
      this.schedule(stepChange);
      this.schedule(this.paint);
    });
    this.schedule(this.paint);
    return this;
  }

  mount() {
    this.container.appendChild(this.label);
    this.container.appendChild(this.canvas);
    this.container.appendChild(this.input);
    return super.mount();
  }

  getValueFromDelta(e) {
    const {
      type,
      min,
      max,
      enums,
      scale
    } = this.state;
    const step = type === "enum" ? 1 : this.state.step || 1;
    const stepRange = this.stepRange;
    const stepsCount = this.stepsCount;
    const range = 100;
    const prevDistance = AbstractItem$1.getDistance({
      value: e.prevValue,
      type,
      min,
      max,
      enums,
      scale
    }) * range;
    const distance = prevDistance + e.fromY - e.y;
    let steps = Math.round((scale === "exp" ? normExp(distance / range) : scale === "log" ? normLog(distance / range) : distance / range) * range / stepRange);
    steps = Math.min(stepsCount, Math.max(0, steps));
    if (type === "enum") return steps;
    if (type === "int") return Math.round(steps * step + min);
    return steps * step + min;
  }

}

class Menu$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "menu");

    _defineProperty(this, "select", void 0);

    _defineProperty(this, "handleChange", e => {
      this.setValue(+e.currentTarget.value);
    });

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      this.select.style.backgroundColor = bgcolor;
      this.select.style.borderColor = bordercolor;
      this.select.style.color = textcolor;
      this.select.style.fontSize = "".concat(fontsize || height * grid / 4, "px");
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(255, 255, 255, 0.25)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.select = document.createElement("select");
    this.getOptions();
    this.setStyle();
    return this;
  }

  getOptions() {
    const {
      enums
    } = this.state;
    this.select.innerHTML = "";

    if (enums) {
      let i = 0;

      for (const key in enums) {
        const option = document.createElement("option");
        option.value = enums[key].toString();
        option.text = key;
        if (i === 0) option.selected = true;
        this.select.appendChild(option);
        i++;
      }
    }
  }

  componentDidMount() {
    super.componentDidMount();
    this.select.addEventListener("change", this.handleChange);
    this.on("style", () => this.schedule(this.setStyle));
    this.on("label", () => this.schedule(this.paintLabel));
    this.on("enums", () => this.schedule(this.getOptions));

    const valueChange = () => {
      for (let i = this.select.children.length - 1; i >= 0; i--) {
        const option = this.select.children[i];
        if (+option.value === this.state.value) this.select.selectedIndex = i;
      }
    };

    this.on("value", () => this.schedule(valueChange));
    valueChange();
    return this;
  }

  mount() {
    this.container.appendChild(this.label);
    this.container.appendChild(this.select);
    return super.mount();
  }

}

class Radio$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "radio");

    _defineProperty(this, "group", void 0);

    _defineProperty(this, "getOptions", () => {
      const {
        enums,
        address
      } = this.state;
      this.group.innerHTML = "";

      if (enums) {
        let i = 0;

        for (const key in enums) {
          const input = document.createElement("input");
          const div = document.createElement("div");
          input.value = enums[key].toString();
          input.name = address;
          input.type = "radio";
          if (i === 0) input.checked = true;
          input.addEventListener("change", () => {
            if (input.checked) this.setValue(enums[key]);
          });
          div.appendChild(input);
          div.append(key);
          this.group.appendChild(div);
          i++;
        }
      }
    });

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        width,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      const fontSize = Math.min(height * grid * 0.1, width * grid * 0.1);
      this.group.style.backgroundColor = bgcolor;
      this.group.style.borderColor = bordercolor;
      this.group.style.color = textcolor;
      this.group.style.fontSize = "".concat(fontsize || fontSize, "px");
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(255, 255, 255, 0.25)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.group = document.createElement("div");
    this.group.className = "faust-ui-component-radio-group";
    this.getOptions();
    this.setStyle();
    return this;
  }

  componentDidMount() {
    super.componentDidMount();
    this.on("style", () => this.schedule(this.setStyle));
    this.on("label", () => this.schedule(this.paintLabel));
    this.on("enums", () => this.schedule(this.getOptions));

    const valueChange = () => {
      for (let i = this.group.children.length - 1; i >= 0; i--) {
        const input = this.group.children[i].querySelector("input");
        if (+input.value === this.state.value) input.checked = true;
      }
    };

    this.on("value", () => this.schedule(valueChange));
    valueChange();
    return this;
  }

  mount() {
    this.container.appendChild(this.label);
    this.container.appendChild(this.group);
    return super.mount();
  }

}

class Led$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "led");

    _defineProperty(this, "canvasDiv", void 0);

    _defineProperty(this, "canvas", void 0);

    _defineProperty(this, "tempCanvas", void 0);

    _defineProperty(this, "ctx", void 0);

    _defineProperty(this, "tempCtx", void 0);

    _defineProperty(this, "setStyle", () => {
      const {
        bgcolor,
        bordercolor
      } = this.state.style;
      this.container.style.backgroundColor = bgcolor;
      this.container.style.borderColor = bordercolor;
    });

    _defineProperty(this, "paint", () => {
      const {
        shape,
        ledbgcolor,
        coldcolor,
        warmcolor,
        hotcolor,
        overloadcolor
      } = this.state.style;
      const {
        min,
        max
      } = this.state;
      const {
        canvas,
        ctx,
        tempCanvas,
        tempCtx,
        distance
      } = this;
      const {
        width,
        height
      } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      const drawHeight = Math.min(height, width) * 0.75;
      const drawWidth = drawHeight;
      const left = (width - drawWidth) * 0.5;
      const top = (height - drawHeight) * 0.5;
      const coldStop = (-18 - min) / (max - min);
      const warmStop = (-6 - min) / (max - min);
      const hotStop = (-3 - min) / (max - min);
      const overloadStop = -min / (max - min);
      const gradient = tempCtx.createLinearGradient(0, 0, tempCanvas.width, 0);
      if (coldStop <= 1 && coldStop >= 0) gradient.addColorStop(coldStop, coldcolor);else if (coldStop > 1) gradient.addColorStop(1, coldcolor);
      if (warmStop <= 1 && warmStop >= 0) gradient.addColorStop(warmStop, warmcolor);
      if (hotStop <= 1 && hotStop >= 0) gradient.addColorStop(hotStop, hotcolor);
      if (overloadStop <= 1 && overloadStop >= 0) gradient.addColorStop(overloadStop, overloadcolor);else if (overloadStop < 0) gradient.addColorStop(0, coldcolor);
      tempCtx.fillStyle = gradient;
      tempCtx.fillRect(0, 0, tempCanvas.width, 10);
      const d = tempCtx.getImageData(Math.min(tempCanvas.width - 1, distance * tempCanvas.width), 0, 1, 1).data;
      if (distance) ctx.fillStyle = "rgb(".concat(d[0], ", ").concat(d[1], ", ").concat(d[2], ")");else ctx.fillStyle = ledbgcolor;
      if (shape === "circle") ctx.arc(width / 2, height / 2, width / 2 - left, 0, 2 * Math.PI);else ctx.rect(left, top, drawWidth, drawHeight);
      ctx.fill();
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(18, 18, 18, 0)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)",
        shape: "circle",
        ledbgcolor: "rgba(18, 18, 18, 1)",
        coldcolor: "rgba(12, 248, 100, 1)",
        warmcolor: "rgba(195, 248, 100, 1)",
        hotcolor: "rgba(255, 193, 10, 1)",
        overloadcolor: "rgba(255, 10, 10, 1)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.canvasDiv = document.createElement("div");
    this.canvasDiv.className = "faust-ui-component-".concat(this.className, "-canvasdiv");
    this.canvas = document.createElement("canvas");
    this.canvas.width = 10;
    this.canvas.height = 10;
    this.ctx = this.canvas.getContext("2d");
    this.tempCanvas = document.createElement("canvas");
    this.tempCtx = this.tempCanvas.getContext("2d");
    this.tempCanvas.width = 128;
    this.tempCanvas.height = 1;
    this.setStyle();
    return this;
  }

  componentDidMount() {
    super.componentDidMount();
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false
    });
    this.on("style", () => this.schedule(this.setStyle));
    this.on("label", () => this.schedule(this.paintLabel));
    this.on("value", () => this.schedule(this.paint));
    this.on("max", () => this.schedule(this.paint));
    this.on("min", () => this.schedule(this.paint));
    this.on("step", () => this.schedule(this.paint));
    this.schedule(this.paint);
    return this;
  }

  mount() {
    this.canvasDiv.appendChild(this.canvas);
    this.container.appendChild(this.label);
    this.container.appendChild(this.canvasDiv);
    return super.mount();
  }

}

class Numerical$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "numerical");

    _defineProperty(this, "input", void 0);

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      this.input.style.backgroundColor = bgcolor;
      this.input.style.borderColor = bordercolor;
      this.input.style.color = textcolor;
      this.input.style.fontSize = "".concat(fontsize || height * grid / 4, "px");
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(255, 255, 255, 0.25)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.input = document.createElement("input");
    this.input.disabled = true;
    this.input.value = (+this.state.value.toFixed(3)).toString() + (this.state.unit || "");
    this.setStyle();
    return this;
  }

  componentDidMount() {
    super.componentDidMount();
    this.on("style", () => this.schedule(this.setStyle));
    this.on("label", () => this.schedule(this.paintLabel));

    const valueChange = () => this.input.value = (+this.state.value.toFixed(3)).toString() + (this.state.unit || "");

    this.on("value", () => this.schedule(valueChange));
    return this;
  }

  mount() {
    this.container.appendChild(this.label);
    this.container.appendChild(this.input);
    return super.mount();
  }

}

class VBargraph$1 extends AbstractItem$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "vbargraph");

    _defineProperty(this, "canvas", void 0);

    _defineProperty(this, "input", void 0);

    _defineProperty(this, "flexDiv", void 0);

    _defineProperty(this, "canvasDiv", void 0);

    _defineProperty(this, "ctx", void 0);

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        width,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      const fontSize = Math.min(height * grid * 0.05, width * grid * 0.2);
      this.input.style.fontSize = "".concat(fontsize || fontSize, "px");
      this.input.style.color = textcolor;
      this.container.style.backgroundColor = bgcolor;
      this.container.style.borderColor = bordercolor;
    });

    _defineProperty(this, "paintValue", 0);

    _defineProperty(this, "maxValue", -Infinity);

    _defineProperty(this, "maxTimer", void 0);

    _defineProperty(this, "paint", () => {
      const {
        barwidth,
        barbgcolor,
        coldcolor,
        warmcolor,
        hotcolor,
        overloadcolor
      } = this.state.style;
      const {
        min,
        max,
        value
      } = this.state;
      const ctx = this.ctx;
      const canvas = this.canvas;
      let {
        width,
        height
      } = this.canvasDiv.getBoundingClientRect();
      width = Math.floor(width);
      height = Math.floor(height);
      canvas.width = width;
      canvas.height = height;
      const drawHeight = height * 0.9;
      const drawWidth = barwidth || Math.min(width / 3, drawHeight * 0.05);
      const left = (width - drawWidth) * 0.5;
      const top = height * 0.05;
      this.paintValue = value;
      const paintValue = this.paintValue;

      if (paintValue > this.maxValue) {
        this.maxValue = paintValue;
        if (this.maxTimer) window.clearTimeout(this.maxTimer);
        this.maxTimer = window.setTimeout(() => {
          this.maxValue = this.paintValue;
          this.maxTimer = undefined;
          this.schedule(this.paint);
        }, 1000);
      }

      if (paintValue < this.maxValue && typeof this.maxTimer === "undefined") {
        this.maxTimer = window.setTimeout(() => {
          this.maxValue = this.paintValue;
          this.maxTimer = undefined;
          this.schedule(this.paint);
        }, 1000);
      }

      const maxValue = this.maxValue;
      const coldStop = (-18 - min) / (max - min);
      const warmStop = (-6 - min) / (max - min);
      const hotStop = (-3 - min) / (max - min);
      const overloadStop = -min / (max - min);
      const gradient = ctx.createLinearGradient(0, drawHeight, 0, top);
      if (coldStop <= 1 && coldStop >= 0) gradient.addColorStop(coldStop, coldcolor);else if (coldStop > 1) gradient.addColorStop(1, coldcolor);
      if (warmStop <= 1 && warmStop >= 0) gradient.addColorStop(warmStop, warmcolor);
      if (hotStop <= 1 && hotStop >= 0) gradient.addColorStop(hotStop, hotcolor);
      if (overloadStop <= 1 && overloadStop >= 0) gradient.addColorStop(overloadStop, overloadcolor);else if (overloadStop < 0) gradient.addColorStop(0, coldcolor);
      ctx.fillStyle = barbgcolor;
      if (paintValue < 0) ctx.fillRect(left, top + (1 - overloadStop) * drawHeight, drawWidth, drawHeight * overloadStop);
      if (paintValue < max) ctx.fillRect(left, top, drawWidth, (1 - overloadStop) * drawHeight - 1);
      ctx.fillStyle = gradient;

      if (paintValue > min) {
        const distance = (Math.min(0, paintValue) - min) / (max - min);
        ctx.fillRect(left, top + (1 - distance) * drawHeight, drawWidth, drawHeight * distance);
      }

      if (paintValue > 0) {
        const distance = Math.min(max, paintValue) / (max - min);
        ctx.fillRect(left, top + (1 - overloadStop - distance) * drawHeight, drawWidth, drawHeight * distance - 1);
      }

      if (maxValue > paintValue) {
        if (maxValue <= 0) {
          const distance = (Math.min(0, maxValue) - min) / (max - min);
          ctx.fillRect(left, top + (1 - distance) * drawHeight, drawWidth, 1);
        }

        if (maxValue > 0) {
          const distance = Math.min(max, maxValue) / (max - min);
          ctx.fillRect(left, Math.max(top, top + (1 - overloadStop - distance) * drawHeight - 1), drawWidth, 1);
        }
      }
    });
  }

  static get defaultProps() {
    const inherited = super.defaultProps;
    return _objectSpread2(_objectSpread2({}, inherited), {}, {
      style: _objectSpread2(_objectSpread2({}, inherited.style), {}, {
        fontname: "Arial",
        fontsize: undefined,
        fontface: "regular",
        bgcolor: "rgba(18, 18, 18, 0)",
        bordercolor: "rgba(80, 80, 80, 0)",
        labelcolor: "rgba(226, 222, 255, 0.5)",
        textcolor: "rgba(18, 18, 18, 1)",
        barwidth: undefined,
        barbgcolor: "rgba(18, 18, 18, 1)",
        coldcolor: "rgba(12, 248, 100, 1)",
        warmcolor: "rgba(195, 248, 100, 1)",
        hotcolor: "rgba(255, 193, 10, 1)",
        overloadcolor: "rgba(255, 10, 10, 1)"
      })
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.flexDiv = document.createElement("div");
    this.flexDiv.className = "faust-ui-component-".concat(this.className, "-flexdiv");
    this.canvasDiv = document.createElement("div");
    this.canvasDiv.className = "faust-ui-component-".concat(this.className, "-canvasdiv");
    this.canvas = document.createElement("canvas");
    this.canvas.width = 10;
    this.canvas.height = 10;
    this.ctx = this.canvas.getContext("2d");
    this.input = document.createElement("input");
    this.input.disabled = true;
    this.input.value = (+this.state.value.toFixed(3)).toString() + (this.state.unit || "");
    this.setStyle();
    return this;
  }

  componentDidMount() {
    super.componentDidMount();
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false
    });
    this.on("style", () => {
      this.schedule(this.setStyle);
      this.schedule(this.paint);
    });
    this.on("label", () => this.schedule(this.paintLabel));

    const valueChange = () => this.input.value = (+this.state.value.toFixed(3)).toString() + (this.state.unit || "");

    this.on("value", () => {
      this.schedule(valueChange);
      this.schedule(this.paint);
    });
    this.on("max", () => this.schedule(this.paint));
    this.on("min", () => this.schedule(this.paint));
    this.on("step", () => this.schedule(this.paint));
    this.schedule(this.paint);
    return this;
  }

  mount() {
    this.canvasDiv.appendChild(this.canvas);
    this.flexDiv.appendChild(this.canvasDiv);
    this.flexDiv.appendChild(this.input);
    this.container.appendChild(this.label);
    this.container.appendChild(this.flexDiv);
    return super.mount();
  }

}

class HBargraph$1 extends VBargraph$1 {
  constructor() {
    super(...arguments);

    _defineProperty(this, "className", "hbargraph");

    _defineProperty(this, "setStyle", () => {
      const {
        height,
        grid,
        fontsize,
        textcolor,
        bgcolor,
        bordercolor
      } = this.state.style;
      this.input.style.fontSize = "".concat(fontsize || height * grid * 0.2, "px");
      this.input.style.color = textcolor;
      this.container.style.backgroundColor = bgcolor;
      this.container.style.borderColor = bordercolor;
    });

    _defineProperty(this, "paint", () => {
      const {
        barwidth,
        barbgcolor,
        coldcolor,
        warmcolor,
        hotcolor,
        overloadcolor
      } = this.state.style;
      const {
        min,
        max,
        value
      } = this.state;
      const ctx = this.ctx;
      const canvas = this.canvas;
      let {
        width,
        height
      } = this.canvasDiv.getBoundingClientRect();
      width = Math.floor(width);
      height = Math.floor(height);
      canvas.width = width;
      canvas.height = height;
      const drawWidth = width * 0.9;
      const drawHeight = barwidth || Math.min(height / 3, drawWidth * 0.05);
      const left = width * 0.05;
      const top = (height - drawHeight) * 0.5;
      this.paintValue = value;
      const paintValue = this.paintValue;

      if (paintValue > this.maxValue) {
        this.maxValue = paintValue;
        if (this.maxTimer) window.clearTimeout(this.maxTimer);
        this.maxTimer = window.setTimeout(() => {
          this.maxValue = this.paintValue;
          this.maxTimer = undefined;
        }, 1000);
      }

      if (paintValue < this.maxValue && typeof this.maxTimer === "undefined") {
        this.maxTimer = window.setTimeout(() => {
          this.maxValue = this.paintValue;
          this.maxTimer = undefined;
        }, 1000);
      }

      const maxValue = this.maxValue;
      const coldStop = (-18 - min) / (max - min);
      const warmStop = (-6 - min) / (max - min);
      const hotStop = (-3 - min) / (max - min);
      const overloadStop = -min / (max - min);
      const gradient = ctx.createLinearGradient(left, 0, drawWidth, 0);
      if (coldStop <= 1 && coldStop >= 0) gradient.addColorStop(coldStop, coldcolor);else if (coldStop > 1) gradient.addColorStop(1, coldcolor);
      if (warmStop <= 1 && warmStop >= 0) gradient.addColorStop(warmStop, warmcolor);
      if (hotStop <= 1 && hotStop >= 0) gradient.addColorStop(hotStop, hotcolor);
      if (overloadStop <= 1 && overloadStop >= 0) gradient.addColorStop(overloadStop, overloadcolor);else if (overloadStop < 0) gradient.addColorStop(0, coldcolor);
      ctx.fillStyle = barbgcolor;
      if (paintValue < 0) ctx.fillRect(left, top, drawWidth * overloadStop, drawHeight);
      if (paintValue < max) ctx.fillRect(left + drawWidth * overloadStop + 1, top, drawWidth * (1 - overloadStop) - 1, drawHeight);
      ctx.fillStyle = gradient;

      if (paintValue > min) {
        const distance = (Math.min(0, paintValue) - min) / (max - min);
        ctx.fillRect(left, top, distance * drawWidth, drawHeight);
      }

      if (paintValue > 0) {
        const distance = Math.min(max, paintValue) / (max - min);
        ctx.fillRect(left + overloadStop * drawWidth + 1, top, distance * drawWidth - 1, drawHeight);
      }

      if (maxValue > paintValue) {
        if (maxValue <= 0) {
          const distance = (Math.min(0, maxValue) - min) / (max - min);
          ctx.fillRect(left + distance * drawWidth - 1, top, 1, drawHeight);
        }

        if (maxValue > 0) {
          const distance = Math.min(max, maxValue) / (max - min);
          ctx.fillRect(left + Math.min(drawWidth - 1, (overloadStop + distance) * drawWidth), top, 1, drawHeight);
        }
      }
    });
  }

  paintLabel() {
    return super.paintLabel("left");
  }

}

class Group extends AbstractComponent {
  constructor() {
    super(...arguments);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "label", void 0);

    _defineProperty(this, "labelCanvas", void 0);

    _defineProperty(this, "labelCtx", void 0);

    _defineProperty(this, "tabs", void 0);

    _defineProperty(this, "children", void 0);

    _defineProperty(this, "layout", void 0);

    _defineProperty(this, "updateUI", () => {
      this.children = [];
      const {
        style,
        type,
        items,
        emitter,
        isRoot
      } = this.state;
      const {
        grid,
        left,
        top,
        width,
        height
      } = style;
      this.label.style.height = "".concat(grid * 0.3, "px");
      this.container.style.left = "".concat(left * grid, "px");
      this.container.style.top = "".concat(top * grid, "px");
      this.container.style.width = "".concat(width * grid, "px");
      this.container.style.height = "".concat(height * grid, "px");
      this.container.className = ["faust-ui-group", "faust-ui-".concat(type), "".concat(isRoot ? "faust-ui-root" : "")].join(" ");
      items.forEach(item => {
        if (item.type.endsWith("group")) {
          const component = Group.getComponent(item, emitter, grid);
          if (component) this.children.push(component);
        } else {
          const ioItem = item;
          const itemComponent = Group.getComponent(ioItem, this.state.emitter, grid);
          if (itemComponent) this.children.push(itemComponent);
        }
      });

      if (type === "tgroup") {
        this.tabs.innerHTML = "";
        this.tabs.style.height = "".concat(grid, "px");
        this.tabs.style.top = "".concat(0.25 * grid, "px");
        this.state.items.forEach((item, i) => {
          const label = item.label;
          const tab = document.createElement("span");
          tab.innerText = label;
          tab.className = "faust-ui-tgroup-tab";
          tab.style.fontSize = "".concat(0.25 * grid, "px");
          tab.style.width = "".concat(2 * grid - 10, "px");
          tab.style.height = "".concat(grid - 10, "px");
          tab.style.lineHeight = "".concat(grid - 10, "px");
          tab.addEventListener("click", () => {
            const groups = [];

            for (let j = 0; j < this.container.children.length; j++) {
              const element = this.container.children[j];
              if (element.classList.contains("faust-ui-group")) groups.push(element);
            }

            for (let j = 0; j < groups.length; j++) {
              const element = groups[j];
              element.style.visibility = i === j ? "visible" : "hidden";
            }

            for (let j = 0; j < this.tabs.children.length; j++) {
              const e = this.tabs.children[j];

              if (i !== j) {
                if (e.classList.contains("active")) e.classList.remove("active");
              } else e.classList.add("active");
            }
          });
          this.tabs.appendChild(tab);
        });
      }
    });
  }

  static parseMeta(metaIn) {
    const metaObject = {};
    if (!metaIn) return {
      metaObject
    };
    metaIn.forEach(m => Object.assign(metaObject, m));

    if (metaObject.style) {
      const enumsRegex = /\{(?:(?:'|_)(.+?)(?:'|_):([-+]?[0-9]*\.?[0-9]+?);)+(?:(?:'|_)(.+?)(?:'|_):([-+]?[0-9]*\.?[0-9]+?))\}/;
      const matched = metaObject.style.match(enumsRegex);

      if (matched) {
        const itemsRegex = /(?:(?:'|_)(.+?)(?:'|_):([-+]?[0-9]*\.?[0-9]+?))/g;
        const enums = {};
        let item; // eslint-disable-next-line no-cond-assign

        while (item = itemsRegex.exec(matched[0])) {
          enums[item[1]] = +item[2];
        }

        return {
          metaObject,
          enums
        };
      }
    }

    return {
      metaObject
    };
  }

  static getComponent(item, emitter, grid) {
    const type = Layout.predictType(item);

    if (type.endsWith("group")) {
      const {
        label,
        items,
        type,
        layout
      } = item;
      const props = {
        label,
        type,
        items,
        style: {
          grid,
          width: layout.width,
          height: layout.height,
          left: layout.offsetLeft,
          top: layout.offsetTop,
          labelcolor: "rgba(255, 255, 255, 0.7)"
        },
        emitter
      };
      return new Group(props);
    }

    const ioItem = item;
    const {
      metaObject,
      enums
    } = this.parseMeta(ioItem.meta);
    const {
      tooltip,
      unit,
      scale
    } = metaObject;
    const {
      label,
      min,
      max,
      address,
      layout
    } = ioItem;
    const props = {
      label,
      address,
      tooltip,
      unit,
      scale: scale || "linear",
      emitter,
      enums,
      style: {
        grid,
        width: layout.width,
        height: layout.height,
        left: layout.offsetLeft,
        top: layout.offsetTop
      },
      type: "float",
      min: isFinite(min) ? min : 0,
      max: isFinite(max) ? max : 1,
      step: "step" in item ? +item.step : 1,
      value: "init" in item ? +item.init || 0 : 0
    };
    if (type === "button") return new Button$1(props);
    if (type === "checkbox") return new Checkbox$1(props);
    if (type === "nentry") return new Nentry$1(props);
    if (type === "knob") return new Knob$1(props);
    if (type === "menu") return new Menu$1(props);
    if (type === "radio") return new Radio$1(props);
    if (type === "hslider") return new HSlider$1(props);
    if (type === "vslider") return new VSlider$1(props);
    if (type === "hbargraph") return new HBargraph$1(props);
    if (type === "vbargraph") return new VBargraph$1(props);
    if (type === "numerical") return new Numerical$1(props);
    if (type === "led") return new Led$1(props);
    return null;
  }
  /**
   * DOM Div container of the group
   *
   * @type {HTMLDivElement}
   * @memberof AbstractItem
   */


  setState(newState) {
    let shouldUpdate = false;

    for (const key in newState) {
      const stateKey = key;
      const stateValue = newState[stateKey];

      if (stateKey === "style") {
        for (const key in newState.style) {
          const styleKey = key;

          if (styleKey in this.state.style && this.state.style[styleKey] !== newState.style[styleKey]) {
            this.state.style[styleKey] = newState.style[styleKey];
            shouldUpdate = true;
          }
        }
      } else if (stateKey in this.state && this.state[stateKey] !== stateValue) {
        this.state[stateKey] = stateValue;
        shouldUpdate = true;
      } else return;

      if (shouldUpdate) this.emit(stateKey, this.state[stateKey]);
    }
  }

  componentWillMount() {
    this.container = document.createElement("div");
    this.tabs = document.createElement("div");
    this.tabs.className = "faust-ui-tgroup-tabs";
    this.label = document.createElement("div");
    this.label.className = "faust-ui-group-label";
    this.labelCanvas = document.createElement("canvas");
    this.labelCtx = this.labelCanvas.getContext("2d");
    this.updateUI();
    this.children.forEach(item => item.componentWillMount());
    return this;
  }

  paintLabel() {
    const label = this.state.label;
    const color = this.state.style.labelcolor;
    const ctx = this.labelCtx;
    const canvas = this.labelCanvas;
    let {
      width,
      height
    } = this.label.getBoundingClientRect();
    if (!width || !height) return this;
    width = Math.floor(width);
    height = Math.floor(height);
    canvas.height = height;
    canvas.width = width;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = "bold ".concat(height * 0.9, "px -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"");
    ctx.fillText(label, 0, height / 2, width);
    return this;
  }

  mount() {
    this.label.appendChild(this.labelCanvas);
    this.container.appendChild(this.label);
    if (this.tabs.children.length) this.container.appendChild(this.tabs);
    this.children.forEach(item => {
      item.mount();
      this.container.appendChild(item.container);
    });
    return this;
  }

  componentDidMount() {
    const handleResize = () => {
      const {
        grid,
        left,
        top,
        width,
        height
      } = this.state.style;
      this.label.style.height = "".concat(grid * 0.3, "px");
      this.container.style.width = "".concat(width * grid, "px");
      this.container.style.height = "".concat(height * grid, "px");
      this.container.style.left = "".concat(left * grid, "px");
      this.container.style.top = "".concat(top * grid, "px");

      if (this.state.type === "tgroup") {
        this.tabs.style.height = "".concat(grid, "px");
        this.tabs.style.top = "".concat(0.25 * grid, "px");

        for (let i = 0; i < this.tabs.children.length; i++) {
          const tab = this.tabs.children[i];
          tab.style.fontSize = "".concat(0.25 * grid, "px");
          tab.style.width = "".concat(2 * grid - 10, "px");
          tab.style.height = "".concat(grid - 10, "px");
          tab.style.lineHeight = "".concat(grid - 10, "px");
        }
      }

      this.paintLabel();
      this.children.forEach(item => item.setState({
        style: {
          grid
        }
      }));
    };

    this.on("style", () => this.schedule(handleResize));

    const itemsChange = () => {
      this.updateUI();
      this.children.forEach(item => item.componentWillMount());
    };

    this.on("items", () => this.schedule(itemsChange));

    const labelChange = () => {
      this.paintLabel();
      this.label.title = this.state.label;
    };

    this.on("label", () => this.schedule(labelChange));
    this.paintLabel();
    if (this.tabs && this.tabs.children.length) this.tabs.children[0].click();
    this.children.forEach(item => item.componentDidMount());
    return this;
  }

}

/**
 * The main class of UI constructor,
 * listening to `resize` window event to resize component,
 * listening to `message` window event to change UI or param value.
 * See readme.
 *
 * @export
 * @class FaustUI
 */
class FaustUI {
  /**
   * Calculate incoming UI's layout, bind window events
   * @param {TOptions} options
   * @memberof FaustUI
   */
  constructor(options) {
    _defineProperty(this, "componentMap", {});

    _defineProperty(this, "DOMroot", void 0);

    _defineProperty(this, "faustUIRoot", void 0);

    _defineProperty(this, "hostWindow", void 0);

    _defineProperty(this, "grid", void 0);

    _defineProperty(this, "_ui", void 0);

    _defineProperty(this, "_layout", void 0);

    _defineProperty(this, "paramChangeByUI", (path, value) => {
      if (!this.hostWindow) return;
      this.hostWindow.postMessage({
        path,
        value,
        type: "param"
      }, "*");
    });

    const {
      root,
      ui: uiIn,
      listenWindowResize,
      listenWindowMessage
    } = options;
    this.DOMroot = root;
    this.ui = uiIn || [];

    if (typeof listenWindowResize === "undefined" || listenWindowResize === true) {
      window.addEventListener("resize", () => {
        this.resize();
      });
    }

    if (typeof listenWindowMessage === "undefined" || listenWindowMessage === true) {
      window.addEventListener("message", e => {
        const {
          data,
          source
        } = e;
        this.hostWindow = source;
        const {
          type
        } = data;
        if (!type) return;

        if (type === "ui") {
          this.ui = data.ui;
        } else if (type === "param") {
          const {
            path,
            value
          } = data;
          this.paramChangeByDSP(path, value);
        }
      });
    }
  }
  /**
   * Render the UI to DOM root
   *
   * @memberof FaustUI
   */


  mount() {
    this.componentMap = {};
    this.DOMroot.innerHTML = "";
    const props = {
      label: "",
      type: "vgroup",
      items: this.ui,
      style: {
        grid: this.grid,
        width: this.layout.width,
        height: this.layout.height,
        left: this.layout.offsetLeft,
        top: this.layout.offsetTop
      },
      isRoot: true,
      emitter: this
    };
    this.faustUIRoot = new Group(props);
    this.faustUIRoot.componentWillMount();
    this.faustUIRoot.mount();
    this.DOMroot.appendChild(this.faustUIRoot.container);
    this.faustUIRoot.componentDidMount();
  }
  /**
   * This method should be called by components to register itself to map.
   *
   * @param {string} path
   * @param {AbstractItem<any>} item
   * @memberof FaustUI
   */


  register(path, item) {
    if (this.componentMap[path]) this.componentMap[path].push(item);else this.componentMap[path] = [item];
  }
  /**
   * Notify the component to change its value.
   *
   * @param {string} path
   * @param {number} value
   * @memberof FaustUI
   */


  paramChangeByDSP(path, value) {
    if (this.componentMap[path]) this.componentMap[path].forEach(item => item.setState({
      value
    }));
  }
  /**
   * Can be overriden, called by components when its value is changed by user.
   *
   * @memberof FaustUI
   */


  /**
   * Calculate UI layout in grid then calculate grid size.
   *
   * @memberof FaustUI
   */
  calc() {
    const {
      items,
      layout
    } = Layout.calc(this.ui);
    this._ui = items;
    this._layout = layout;
    this.calcGrid();
  }
  /**
   * Calculate grid size by DOM root size and layout size in grids.
   *
   * @returns
   * @memberof FaustUI
   */


  calcGrid() {
    const {
      width,
      height
    } = this.DOMroot.getBoundingClientRect();
    const grid = Math.max(40, Math.min(width / this._layout.width, height / this._layout.height));
    this.grid = grid;
    return grid;
  }
  /**
   * Force recalculate grid size and resize UI
   *
   * @returns
   * @memberof FaustUI
   */


  resize() {
    if (!this.faustUIRoot) return;
    this.calcGrid();
    this.faustUIRoot.setState({
      style: {
        grid: this.grid
      }
    });
  }

  get ui() {
    return this._ui;
  }

  set ui(uiIn) {
    this._ui = uiIn;
    this.calc();
    this.mount();
  }

  get layout() {
    return this._layout;
  }

  get minWidth() {
    return this._layout.width * 40 + 1;
  }

  get minHeight() {
    return this._layout.height * 40 + 1;
  }

}

const instantiate = () => {
  const faustUI = new FaustUI({
    root: document.getElementById("root")
  });
  let host;
  window.addEventListener("message", e => {
    const {
      source
    } = e;
    host = source;
  });
  window.addEventListener("keydown", e => {
    if (host) host.postMessage({
      type: "keydown",
      key: e.key
    }, "*");
  });
  window.addEventListener("keyup", e => {
    if (host) host.postMessage({
      type: "keyup",
      key: e.key
    }, "*");
  });
  window.faustUI = faustUI;
};

export { FaustUI, instantiate };
//# sourceMappingURL=index.js.map
