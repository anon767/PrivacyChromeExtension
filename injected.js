// Injected script - runs in page context to override native APIs
(function() {
  'use strict';



  /************************ 1. Keyboard privacy ************************/
  
  // Override modifier key properties on all events to always return false
  const modifierKeys = ['metaKey', 'ctrlKey', 'altKey'];
  
  // Find the actual prototype that has these properties
  let baseProto = KeyboardEvent.prototype;
  while (baseProto && !Object.getOwnPropertyDescriptor(baseProto, 'metaKey')) {
    baseProto = Object.getPrototypeOf(baseProto);
  }
  
  
  const eventPrototypes = [
    KeyboardEvent.prototype,
    MouseEvent.prototype,
    PointerEvent.prototype,
    TouchEvent.prototype,
    WheelEvent.prototype,
    UIEvent.prototype,
    baseProto
  ].filter(Boolean);

  eventPrototypes.forEach(proto => {
    modifierKeys.forEach(key => {
      const originalDesc = Object.getOwnPropertyDescriptor(proto, key);
      if (originalDesc && originalDesc.get) {
        Object.defineProperty(proto, key, {
          get: function() {
            return false;
          },
          configurable: true,
          enumerable: true
        });
      }
    });
  });

  // Also override getModifierState to always return false
  if (KeyboardEvent.prototype.getModifierState) {
    const origGetModifierState = KeyboardEvent.prototype.getModifierState;
    KeyboardEvent.prototype.getModifierState = function(key) {
      if (['Meta', 'Control', 'Alt', 'OS'].includes(key)) {
        return false;
      }
      return origGetModifierState.call(this, key);
    };
  }

  /************************************** 2. Focus & visibility obfuscation **************************************/
  
  // Override document.hidden to always return false
  Object.defineProperty(document, 'hidden', {
    get() { return false; },
    configurable: true,
    enumerable: true
  });

  // Override document.visibilityState to always return 'visible'
  Object.defineProperty(document, 'visibilityState', {
    get() { return 'visible'; },
    configurable: true,
    enumerable: true
  });

  // Override document.hasFocus to always return true
  const origHasFocus = document.hasFocus;
  document.hasFocus = function() { return true; };

  /************************************** 3. Block event listeners & dispatch **************************************/
  
  const BLOCKED_EVENTS = [
    'visibilitychange',
    'webkitvisibilitychange',
    'blur',
    'focus',
    'focusin',
    'focusout',
    'pagehide',
    'pageshow',
    'beforeunload',
    'unload'
  ];

  const BLOCKED_KEY_EVENTS = ['keydown', 'keyup', 'keypress'];

  // Save originals before overriding
  const origDocAdd = Document.prototype.addEventListener;
  const origWinAdd = Window.prototype.addEventListener;
  const origElemAdd = Element.prototype.addEventListener;

  // Override addEventListener to wrap listeners
  Document.prototype.addEventListener = function(type, listener, options) {
    if (BLOCKED_EVENTS.includes(type)) {
      return; // Silently ignore
    }
    if (BLOCKED_KEY_EVENTS.includes(type) && typeof listener === 'function') {
      // Wrap keyboard listeners to filter out modifier keys
      const wrapped = function(e) {
        // Allow essential shortcuts (copy, paste, cut, undo, redo, select all)
        const essentialKeys = ['c', 'v', 'x', 'z', 'y', 'a'];
        const isEssential = essentialKeys.includes(e.key.toLowerCase());
        
        // Block if it's a modifier key itself being pressed
        if (['Meta', 'Control', 'Alt', 'OS', 'Shift'].includes(e.key)) {
          return;
        }
        
        // Block if any modifiers are held down, UNLESS it's an essential shortcut
        const realMeta = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'metaKey')?.get?.call(e);
        const realCtrl = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'ctrlKey')?.get?.call(e);
        const realAlt = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'altKey')?.get?.call(e);
        
        if ((realMeta || realCtrl || realAlt) && !isEssential) {
          return;
        }
        return listener.call(this, e);
      };
      listener.__privacy_wrapped = wrapped;
      return origDocAdd.call(this, type, wrapped, options);
    }
    return origDocAdd.call(this, type, listener, options);
  };

  Window.prototype.addEventListener = function(type, listener, options) {
    if (BLOCKED_EVENTS.includes(type)) {
      return; // Silently ignore
    }
    if (BLOCKED_KEY_EVENTS.includes(type) && typeof listener === 'function') {
      const wrapped = function(e) {
        // Allow essential shortcuts
        const essentialKeys = ['c', 'v', 'x', 'z', 'y', 'a'];
        const isEssential = essentialKeys.includes(e.key.toLowerCase());
        
        // Block modifier keys themselves
        if (['Meta', 'Control', 'Alt', 'OS', 'Shift'].includes(e.key)) {
          return;
        }
        
        // Block if modifiers are held, unless essential
        const realMeta = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'metaKey')?.get?.call(e);
        const realCtrl = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'ctrlKey')?.get?.call(e);
        const realAlt = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'altKey')?.get?.call(e);
        
        if ((realMeta || realCtrl || realAlt) && !isEssential) {
          return;
        }
        return listener.call(this, e);
      };
      listener.__privacy_wrapped = wrapped;
      return origWinAdd.call(this, type, wrapped, options);
    }
    return origWinAdd.call(this, type, listener, options);
  };

  Element.prototype.addEventListener = function(type, listener, options) {
    if (BLOCKED_EVENTS.includes(type)) {
      return; // Silently ignore
    }
    if (BLOCKED_KEY_EVENTS.includes(type) && typeof listener === 'function') {
      const wrapped = function(e) {
        // Allow essential shortcuts
        const essentialKeys = ['c', 'v', 'x', 'z', 'y', 'a'];
        const isEssential = essentialKeys.includes(e.key.toLowerCase());
        
        if (['Meta', 'Control', 'Alt', 'OS', 'Shift'].includes(e.key)) {
          return;
        }
        
        const realMeta = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'metaKey')?.get?.call(e);
        const realCtrl = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'ctrlKey')?.get?.call(e);
        const realAlt = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'altKey')?.get?.call(e);
        
        if ((realMeta || realCtrl || realAlt) && !isEssential) {
          return;
        }
        return listener.call(this, e);
      };
      listener.__privacy_wrapped = wrapped;
      return origElemAdd.call(this, type, wrapped, options);
    }
    return origElemAdd.call(this, type, listener, options);
  };

  // Block property-based event handlers
  const fakeHandlers = {};
  BLOCKED_EVENTS.forEach((ev) => {
    const prop = 'on' + ev;
    fakeHandlers[prop] = null;
    
    // Block on document
    try {
      Object.defineProperty(document, prop, {
        get() { return fakeHandlers[prop]; },
        set(handler) { 
          fakeHandlers[prop] = handler;
        },
        configurable: true
      });
    } catch (_) {}
    
    // Block on window
    try {
      Object.defineProperty(window, prop, {
        get() { return fakeHandlers[prop]; },
        set(handler) { 
          fakeHandlers[prop] = handler;
        },
        configurable: true
      });
    } catch (_) {}
  });

  /****************************************** 4. Extra tracking blocks ******************************************/
  
  // Throttle mouse tracking
  const HIGH_FREQ_EVENTS = ['mousemove', 'pointermove'];
  const origAddEvt = EventTarget.prototype.addEventListener;
  const origRemoveEvt = EventTarget.prototype.removeEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (HIGH_FREQ_EVENTS.includes(type) && typeof listener === 'function') {
      let last = 0;
      const wrapped = function(e) {
        const now = performance.now();
        if (now - last > 100) {
          last = now;
          return listener.call(this, e);
        }
      };
      listener.__wrapped_for_privacy = wrapped;
      return origAddEvt.call(this, type, wrapped, options);
    }
    return origAddEvt.call(this, type, listener, options);
  };

  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    if (HIGH_FREQ_EVENTS.includes(type) && listener && listener.__wrapped_for_privacy) {
      return origRemoveEvt.call(this, type, listener.__wrapped_for_privacy, options);
    }
    return origRemoveEvt.call(this, type, listener, options);
  };

  // Block third-party beacons
  const origSendBeacon = navigator.sendBeacon;
  navigator.sendBeacon = function(url, data) {
    try {
      const target = new URL(url, location.href);
      if (target.origin !== location.origin) {
        return false;
      }
    } catch (_) {
      return false;
    }
    return origSendBeacon.call(this, url, data);
  };

})();
