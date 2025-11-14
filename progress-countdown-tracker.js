export let pcTracker = null;

Hooks.once("init", () => {

  // is the tracker window visible?
  game.settings.register("progress-countdown-tracker", "trackerVisible", {
    name: "Visible",
    hint: "Make the tracker window visible if you've closed it.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      if(!game.pcTracker) {
        game.pcTracker = new ProgressCountdownTrackerApp();
      }
      if(value && !game.pcTracker.rendered) {
        game.pcTracker.render(true);
        //console.log(pcTracker.rendered);
        //console.log("visible setting:", game.settings.get("progress-countdown-tracker", "trackerVisible"));
      } else {
        game.pcTracker.close();
        //console.log(pcTracker.rendered);
        //console.log("visible setting:", game.settings.get("progress-countdown-tracker", "trackerVisible"));
      }
    }
  });

  // progress pip character
  game.settings.register("progress-countdown-tracker", "progressPipCharacter", {
    name: "Progress Pip Character", // (<a href="https://fontawesome.com/search?o=r" target="_blank">Font Awesome</a>)
    hint: "Change the pip character for progress trackers. Use a Font Awesome icon name without quotes. Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    default: "fa-solid fa-circle-small", // unicode black circle
    onChange: async (value) => {
      /*// Validate single char
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        ui.notifications.warn("Progress Pip Character is blank. Using default.");
        await game.settings.set("progress-countdown-tracker", "progressPipCharacter", "●");
      } else if (trimmed.length > 1) {
        const firstChar = trimmed.charAt(0);
        ui.notifications.warn("You must enter exactly one character. Using only the first character.");
        await game.settings.set("progress-countdown-tracker", "progressPipCharacter", firstChar);
      }*/
      const force = game.settings.get("progress-countdown-tracker", "pushPipChars");
      if (game.user.isGM && force) {
        game.socket.emit("module.progress-countdown-tracker", {
          action: "setPipChars",
          chars: value,
          type: "pro"
        });
      }
      game.pcTracker.render(true); 
    }
  });
  
  // consequence pip character
  game.settings.register("progress-countdown-tracker", "consequencePipCharacter", {
    name: "Consequence Pip Character",
    hint: "Change the pip character for consequence trackers. Use a Font Awesome icon name without quotes. Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    default: "fa-solid fa-bolt", // unicode black circle
    onChange: async (value) => {
      /*// Validate single char
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        ui.notifications.warn("Consequence Pip Character field is blank. Using default.");
        await game.settings.set("progress-countdown-tracker", "consequencePipCharacter", "●");
      } else if (trimmed.length > 1) {
        const firstChar = trimmed.charAt(0);
        ui.notifications.warn("You must enter exactly one character. Using only the first character.");
        await game.settings.set("progress-countdown-tracker", "consequencePipCharacter", firstChar);
      }*/
      const force = game.settings.get("progress-countdown-tracker", "pushPipChars");
      if (game.user.isGM && force) {
        game.socket.emit("module.progress-countdown-tracker", {
          action: "setPipChars",
          chars: value,
          type: "con"
        });
      }
      game.pcTracker.render(true); 
    }
  });

  // apply pip characters to players
  game.settings.register("progress-countdown-tracker", "pushPipChars", {
    name: "Apply pip characters for players",
    hint: "(Overrides their settings when you make changes.)",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // progress pip color
  game.settings.register("progress-countdown-tracker", "progressPipColor", {
    name: "Progress Pip Color",
    hint: "Change the color of active pips for progress trackers. Applies only to you.",
    scope: "client",
    config: true,
    type: new game.colorPicker.ColorPickerField(),
    default: "#0CA011",
    onChange: (value) => {
      const force = game.settings.get("progress-countdown-tracker", "pushColors");
      if (game.user.isGM && force) {
        game.socket.emit("module.progress-countdown-tracker", {
          action: "setPipColors",
          colors: value,
          type: "pro"
        });
      }
      game.pcTracker.render(true); 
    }
  });

  // consequence pip color
  game.settings.register("progress-countdown-tracker", "consequencePipColor", {
    name: "Consequence Pip Color",
    hint: "Change the color of active pips for consequence trackers. Applies only to you.",
    scope: "client",
    config: true,
    type: new game.colorPicker.ColorPickerField(),
    default: "#A02B93",
    onChange: (value) => {
      const force = game.settings.get("progress-countdown-tracker", "pushColors"); 
      if (game.user.isGM && force) {
        game.socket.emit("module.progress-countdown-tracker", {
          action: "setPipColors",
          colors: value,
          type: "con"
        });
      }
      game.pcTracker.render(true); 
    }
  });

  // apply colors to players
  game.settings.register("progress-countdown-tracker", "pushColors", {
    name: "Apply pip colors for players",
    hint: "(Overrides their settings when you make changes.)",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // keep track of the tracker's position
  game.settings.register("progress-countdown-tracker", "trackerPosition", {
    name: "Tracker Position",
    scope: "client",
    config: false,
    type: Object,
    default: {top:100, left:100}
  });

  // store collapsed state
  game.settings.register("progress-countdown-tracker", "collapsed", {
    name: "Collapsed",
    scope: "client",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("progress-countdown-tracker", "trackerOrder", {
    name: "Tracker Order",
    scope: "client",
    config: false,
    type: Array,
    default: []
  });

  game.settings.register("progress-countdown-tracker", "trackerData", {
    name: "Tracker Data",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });

  game.settings.register("progress-countdown-tracker", "trackerDataChanged", { // store whether trackerData has changed since user collapsed the trackers
    name: "Tracker Data Changed Tracker",
    scope: "client",
    config: false,
    type: Boolean,
    default: false
  });

  Handlebars.registerHelper("compute_pc_bar_range", function(n, block) {
    let accum = '';
    for (let i = 0; i < n; ++i) {
        // Create a new data frame for each iteration
        let data = Handlebars.createFrame(block.data); 
        // Set the @index property on the data frame
        data.index = i; 
        accum += block.fn(i, { data: data }); // Pass the new context and data frame
    }
    return accum;
  });

  Handlebars.registerHelper("ifEquals", function (a, b, options) {
    return (a === b) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("or", function(...args) {
    const options = args.pop(); // options is always the last argument

    // The actual values to check for truthiness are everything else
    const values = args;

    const result = values.some(Boolean); // Check if any value is truthy

    // Check if it's being used as a BLOCK helper (i.e., it has an inner block to render)
    if (options.fn && typeof options.fn === 'function') {
        if (result) {
            return options.fn(this); // Render the block if true
        } else {
            // Only try to call options.inverse if it exists (for {{else}} blocks)
            if (options.inverse && typeof options.inverse === 'function') {
                return options.inverse(this); // Render the else block if false
            } else {
                // If no {{else}} block, just return an empty string or nothing
                return ""; // Or you could return nothing, depending on desired behavior
            }
        }
    } else {
        // If it's *not* a block helper, just return the boolean result
        // This makes it behave like an inline helper `{{or a b}}`
        return result;
    }
  });

  Handlebars.registerHelper("getSetting", function(module, settingName) {
    return game.settings.get(module, settingName);
  });

}); // end init

Hooks.on("renderSettingsConfig", (app, element, data) => {
  let target = element.querySelector('[name="progress-countdown-tracker.progressPipCharacter"]').closest(".form-group");
  target.insertAdjacentHTML("beforebegin", `<h6>Pip Characters</h6><a href="https://fontawesome.com/search?o=r" target="_blank">Font Awesome</a>`);
  target = element.querySelector('[name="progress-countdown-tracker.progressPipColor"]').closest(".form-group");
  target.insertAdjacentHTML("beforebegin", `<h6>Pip Colors</h6>`);
  target = element.querySelector('[name="progress-countdown-tracker.moduleFontFamily"]').closest(".form-group");
  target.insertAdjacentHTML("beforebegin", `<h6>Font</h6>`);
});

// capture "push to client" tickbox changes in real time
Hooks.on("renderSettingsConfig", (app, html, data) => {
  const checkboxPushColors = html.querySelector(`input[name="progress-countdown-tracker.pushColors"]`);
  const checkboxPushChars = html.querySelector(`input[name="progress-countdown-tracker.pushPipChars"]`);
  const checkboxPushFont = html.querySelector(`input[name="progress-countdown-tracker.pushFont"]`);

  if(checkboxPushColors) {
    checkboxPushColors.addEventListener("change", ev => {
      const checked = ev.currentTarget.checked;
      game.settings.set("progress-countdown-tracker", "pushColors", checked);
      if(checked) {
        const pc = game.settings.get("progress-countdown-tracker", "progressPipColor");
        const cc = game.settings.get("progress-countdown-tracker", "consequencePipColor");
        const colors = { pc, cc };
        game.socket.emit("module.progress-countdown-tracker", { action: "setPipColors", colors, type: "both" });
      }
    });
  }
  if(checkboxPushChars) {
    checkboxPushChars.addEventListener("change", ev => {
      const checked = ev.currentTarget.checked;
      game.settings.set("progress-countdown-tracker", "pushPipChars", checked);
      if(checked) {
        const pc = game.settings.get("progress-countdown-tracker", "progressPipCharacter");
        const cc = game.settings.get("progress-countdown-tracker", "consequencePipCharacter");
        const chars = { pc, cc };
        //console.log(chars);
        game.socket.emit("module.progress-countdown-tracker", { action: "setPipChars", chars, type: "both" });
      }
    });
  }
  if(checkboxPushFont) {
    checkboxPushFont.addEventListener("change", ev => {
      const checked = ev.currentTarget.checked;
      game.settings.set("progress-countdown-tracker", "pushFont", checked);
      if(checked) {
        const f = game.settings.get("progress-countdown-tracker", "moduleFontFamily");
        game.socket.emit("module.progress-countdown-tracker", { action: "setFont", value: f });
      }
    });
  }
});

Hooks.once('ready', async () => {

  // Final config menu item
  const fontChoices = {};
  const FontConfigAPI = foundry.applications.settings.menus.FontConfig;
  const availableFonts = FontConfigAPI.getAvailableFonts();
  //console.log("availablefonts", availableFonts);
  for (const fontName of availableFonts) {
    fontChoices[fontName] = fontName;
  }
  // font selector
  game.settings.register("progress-countdown-tracker", "moduleFontFamily", {
    name: "Module Font Family",
    hint: "Select a font for use by this module. Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    choices: fontChoices,
    default: "Signika",
    onChange: (value) => {
      const force = game.settings.get("progress-countdown-tracker", "pushFont"); 
      if (game.user.isGM && force) {
        game.socket.emit("module.progress-countdown-tracker", {
          action: "setFont",
          value: value
        });
      }
      game.pcTracker.render(true); 
    }
  });
  // push font to client option
  game.settings.register("progress-countdown-tracker", "pushFont", {
    name: "Apply font for players",
    hint: "(Overrides their settings when you make changes.)",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Listener for GM pushing settings to clients
  if (game.user) {
    game.socket.on("module.progress-countdown-tracker", (data) => {
      if (data.action === "setPipColors") {
        if (data.type === "pro") {
          game.settings.set("progress-countdown-tracker", "progressPipColor", data.colors);
        }
        if (data.type === "con") {
          game.settings.set("progress-countdown-tracker", "consequencePipColor", data.colors);
        }
        if (data.type === "both") {
          const {pc,cc} = data.colors;
          game.settings.set("progress-countdown-tracker", "progressPipColor", pc);
          game.settings.set("progress-countdown-tracker", "consequencePipColor", cc);
        }
      }
      if (data.action === "setPipChars") {
        if (data.type === "pro") {
          console.log(data.type, data.chars);
          game.settings.set("progress-countdown-tracker", "progressPipCharacter", data.chars);
        }
        if (data.type === "con") {
          game.settings.set("progress-countdown-tracker", "consequencePipCharacter", data.chars);
        }
        if (data.type === "both") {
          const {pc,cc} = data.chars;
          game.settings.set("progress-countdown-tracker", "progressPipCharacter", pc);
          game.settings.set("progress-countdown-tracker", "consequencePipCharacter", cc);
        }
      }
      if (data.action === "setFont") {
        game.settings.set("progress-countdown-tracker", "moduleFontFamily", data.value);
      }
    });
  }

  // Module init
  game.pcTracker = new ProgressCountdownTrackerApp();
  const inactiveOpacity = game.settings.get("core", "inactiveOpacity");
  await game.pcTracker.render(true);

  //console.log("DEBUG: foundry object available:", typeof foundry);
  //console.log("DEBUG: foundry.applications.api available:", typeof foundry?.applications?.api);
  //console.log("DEBUG: HandlebarsApplicationMixin available:", typeof foundry?.applications?.api?.HandlebarsApplicationMixin);
  //console.log("DEBUG: ApplicationV2 available:", typeof foundry?.applications?.api?.ApplicationV2);
  //console.log("DEBUG: pcTracker Instance Options:", game.pcTracker.options);
  //console.log("DEBUG: pcTracker Instance Frame Options:", game.pcTracker.options.frame); // Check if frame options are inherited/set
  //console.log("DEBUG: pcTracker Instance HTML Element:", game.pcTracker.element); // Check the element reference
  //console.log("DEBUG: Does pcTracker have _onRender method?", typeof game.pcTracker._onRender); // Should be 'function'
  //console.log("num trackers:", game.settings.get("progress-countdown-tracker", "trackerData").length);

  // Re-render socket
  game.socket.on("module.progress-countdown-tracker", (payload) => {
    if (payload.action === "renderApplication") {
      //console.log("payload.action is renderApplication");
      const applicationInstance = foundry.applications.instances.get("progress-countdown-tracker");
      //console.log("applicationInstance", applicationInstance);
      if (applicationInstance) {
        //console.log("applicationInstance exists");
        applicationInstance.render(true);
      }
    }
    // trackerDataChanged force client update
    if (payload.action === "syncTrackerDataChanged") {
      const collapsed = game.settings.get("progress-countdown-tracker", "collapsed");
      if (collapsed) {
        game.settings.set("progress-countdown-tracker", "trackerDataChanged", true);
      }
    }
    // GM forceUncollapse force client update
    if (payload.action === "forceUncollapse") {
      game.settings.set("progress-countdown-tracker", "collapsed", false);
      game.settings.set("progress-countdown-tracker", "trackerVisible", true);
    }
    // GM force window open when updated (collapsed)
    if (payload.action === "showClientCollapsed") {
      const windowVis = game.settings.get("progress-countdown-tracker", "trackerVisible");
      if(!windowVis) {
        game.settings.set("progress-countdown-tracker", "trackerDataChanged", true);
        game.settings.set("progress-countdown-tracker", "collapsed", true);
        game.settings.set("progress-countdown-tracker", "trackerVisible", true);
      }
    }
  });  
  
});

class ProgressCountdownTrackerApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) { //HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  
  static get DEFAULT_OPTIONS() {
    const storedPosition = game.settings.get("progress-countdown-tracker", "trackerPosition");
    //const baseOptions = super.DEFAULT_OPTIONS;
    const baseOptions = foundry.utils.deepClone(super.DEFAULT_OPTIONS);
    const customOptions = {
      id: "progress-countdown-tracker",
      template: "modules/progress-countdown-tracker/templates/trackers.html",
      popOut: true,
      resizeable: false,
      minimizable: true,
      window: {
        title: "Trackers",
      },
      position: {
        top: storedPosition.top,
        left: storedPosition.left,
        width: "auto",
        height: "auto"
      },
      classes: ["progress-countdown-trackers-window"],
      actions: {
        addTracker: ProgressCountdownTrackerApp._onAddTracker,
        delTracker: ProgressCountdownTrackerApp._onDelTracker,
        addPipCont: ProgressCountdownTrackerApp._onAddPipCont, // add a pip to the tracker
        subPipCont: ProgressCountdownTrackerApp._onSubPipCont, // subtract a pip from the tracker
        addPip: ProgressCountdownTrackerApp._onAddPip, // color in the next pip in the tracker
        subPip: ProgressCountdownTrackerApp._onSubPip, // gray out the next pip in the tracker
        toggleType: ProgressCountdownTrackerApp._onToggleType, // toggle between consequence and progress
        changeToProg: ProgressCountdownTrackerApp._onChangeToProg,
        changeToCons: ProgressCountdownTrackerApp._onChangeToCons,
        toggleVis: ProgressCountdownTrackerApp._onToggleVis, // toggle visibility of the tracker
        //moveTracker: ProgressCountdownTrackerApp._onMoveTracker, // grab one tracker and re-position it within the list
        //editTrackerName: ProgressCountdownTrackerApp._onEditTrackerName
        collapseTrackers: ProgressCountdownTrackerApp._onCollapseTrackers, // toggle to collapse / expand the tracker bars
        closeTrackers: ProgressCountdownTrackerApp._onCloseTrackers
      }
    }
    return foundry.utils.mergeObject(baseOptions, customOptions, { inplace: false, overwrite: true} );
  }
  
  async _prepareContext(options) {
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const collapsed = game.settings.get("progress-countdown-tracker", "collapsed");
    const order = game.settings.get("progress-countdown-tracker", "trackerOrder");
    const isGM = game.user.isGM;
    //console.log("isGM _prepareContext:", isGM);

    // Apply saved ordering
    const ordered = order
      .map(id => data.find(t => t.id == id))
      .filter(Boolean);

    const unordered = data.filter(t => !order.includes(t.id));
    const fullList = [...ordered, ...unordered];

    /*
    console.log("_prepareContext return:", {
      isGM,
      collapsed: collapsed,
      progressColor: game.settings.get("progress-countdown-tracker", "progressPipColor"),
      consequenceColor: game.settings.get("progress-countdown-tracker", "consequencePipColor"),
      trackers: fullList
    });
    */

    // Get max pip count of any tracker bar (so all bars can be uniform) - needs to be separate for players and GM
    let maxPips = 0;
    let maxPipsPlayer = 1; // in case there are visible trackers
    for (const tracker of data) {
      if (tracker.pip_cnt > maxPips) {
        maxPips = tracker.pip_cnt;
      }
      if (tracker.visible && tracker.pip_cnt > maxPipsPlayer) {
        maxPipsPlayer = tracker.pip_cnt;
      }
    }
    // Add 1 to maxPipsPlayer for easy buffer
    maxPipsPlayer += 1;

    // Get pip characters
    const progressPipChar = game.settings.get("progress-countdown-tracker", "progressPipCharacter");
    const consequencePipChar = game.settings.get("progress-countdown-tracker", "consequencePipCharacter");
    // Are they font awesome icons?
    //const progIsFa = (progressPipChar.includes('fa-') || progressPipChar.startsWith('fas '))
    //const consIsFa = (consequencePipChar.includes('fa-') || consequencePipChar.startsWith('fas '))

    return {
      isGM,
      collapsed: collapsed,
      //collapsed: finalCollapsed,
      progressColor: game.settings.get("progress-countdown-tracker", "progressPipColor"),
      consequenceColor: game.settings.get("progress-countdown-tracker", "consequencePipColor"),
      trackers: fullList,
      maxPips: maxPips,
      maxPipsPlayer: maxPipsPlayer,
      progressPipChar: progressPipChar,
      consequencePipChar: consequencePipChar
      //progIsFa: progIsFa,
      //consIsFa: consIsFa
    };
  }

  async _renderHTML(context, options) {
    //const html = await foundry.applications.handlebars.renderTemplate(this.options.template, await this.getData());
    //console.log("_renderHTML context:", context);
    const html = await foundry.applications.handlebars.renderTemplate("modules/progress-countdown-tracker/templates/trackers.html", context); //this.getData()); //this.getData()); //context);
    //const template = document.createElement("template");
    //template.innerHTML = html.trim();
    //return template.content.firstElementChild;
    //console.log("isGM:", context.isGM);
    return html;
  }

  async _replaceHTML(element, html) {
    //console.log("element passed to _replaceHTML:", element);
    //console.log("html passed to _replaceHTML:", html);
    
    //const content = html instanceof HTMLElement ? html : (() => {
    //  const template = document.createElement("template");
    //  template.innerHTML = html.trim();
    //  return template.content;
    //})();

    html.innerHTML = element;    
  }

  static async _onAddTracker(event, element) {
    event.preventDefault();
    //console.log("add tracker clicked");
  
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const order = game.settings.get("progress-countdown-tracker", "trackerOrder");
    let base = "New Tracker";
    let i = 0 ;
    let name;
    do {
      name = base + (i ? ` ${i}` : "");
      i++;
    } while (data.find(t => t.name === name));

    const id = foundry.utils.randomID(16);
    const newTracker = {
      id,
      name,
      type: "progress",
      pip_cnt: 4,
      filled_cnt: 4,
      visible: false
    };
    data.push(newTracker);
    order.push(id);

    await game.settings.set("progress-countdown-tracker", "trackerData", data);
    await game.settings.set("progress-countdown-tracker", "trackerOrder", order);
    this.render();
    game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
  }

  static async _onDelTracker(event, element) {
    //console.log("delete tracker clicked")
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    const id = trackerRow.dataset.id;
    let data = game.settings.get("progress-countdown-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    let order = game.settings.get("progress-countdown-tracker", "trackerOrder");
    data = data.filter(t => t.id !== id);
    order = order.filter(i => i !== id);
    await game.settings.set("progress-countdown-tracker", "trackerData", data);
    await game.settings.set("progress-countdown-tracker", "trackerOrder", order);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
  }

  static async _onCollapseTrackers(event, element) {
    //console.log("collapse/expand toggle clicked")
    const current = game.settings.get("progress-countdown-tracker", "collapsed");
    //console.log("collapsed:", current);
    //if (current) { // if the tracker is collapsed, clear trackerDataChanged (b/c the user is now expanding it); edit: since this is a toggle, needs to be set to false whenever it's clicked (safe)
      game.settings.set("progress-countdown-tracker", "trackerDataChanged", false);
    //}
    await game.settings.set("progress-countdown-tracker", "collapsed", !current);
    this.render();
  }

  _onClose(options) {
    //console.log("_onClose called");
    super._onClose(options);
    game.settings.set("progress-countdown-tracker", "trackerVisible", false);
  }

  // close window (implementing the custom button)
  static async _onCloseTrackers(event, element) {
    //console.log("trying to close");
    event.preventDefault();
    if (game.pcTracker?.rendered) {
      game.pcTracker.close(); 
      game.settings.set("progress-countdown-tracker", "trackerVisible", false);
    }
  }

  static async _onChangeToProg(event, element) { 
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    const type = thisTracker.type;
    if(thisTracker && thisTracker.type !== "progress") {
      const updatedData = data.map(tracker => {
        if(tracker.id === id) {
          return {
            ...tracker,
            type: "progress"
          };
        } else {
          return tracker
        }
      });
      await game.settings.set("progress-countdown-tracker", "trackerData", updatedData);
      this.render();
      if(thisTracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); }
      game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
    }
  }

  static async _onChangeToCons(event, element) { 
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    const type = thisTracker.type;
    if(thisTracker && thisTracker.type !== "consequence") {
      const updatedData = data.map(tracker => {
        if(tracker.id === id) {
          return {
            ...tracker,
            type: "consequence"
          };
        } else {
          return tracker
        }
      });
      await game.settings.set("progress-countdown-tracker", "trackerData", updatedData);
      this.render();
      if(thisTracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); }
      game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
    }
  }
    
  static async _onToggleVis(event, element) { //.toggle-visibility
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    if(!thisTracker) return;

    const updatedData = data.map(tracker => {
      if(tracker.id === id) {
        return {
          ...tracker,
          visible: !tracker.visible
        };
      } else {
        return tracker
      }
    });
    
    await game.settings.set("progress-countdown-tracker", "trackerData", updatedData);
    this.render();
    //if(!thisTracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); }
    if(!thisTracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "forceUncollapse" }); }
    game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
  }

  static async _onAddPipCont(event, element) {
    //console.log("add pip container clicked")
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    if(!thisTracker) return;

    const updatedData = data.map(tracker => {
      if(tracker.id === id) {
        return {
          ...tracker,
          pip_cnt: Math.min(tracker.pip_cnt + 1, 24)
        };
      } else {
        return tracker
      }
    });
    
    await game.settings.set("progress-countdown-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
  }

  static async _onSubPipCont(event, element) {
    //console.log("sub pip container clicked")
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    if(!thisTracker) return;

    const updatedData = data.map(tracker => {
      if(tracker.id === id) {
        return {
          ...tracker,
          pip_cnt: Math.max(tracker.pip_cnt - 1, 1),
          filled_cnt: Math.min(tracker.pip_cnt - 1, tracker.filled_cnt)
        };
      } else {
        return tracker
      }
    });
    
    await game.settings.set("progress-countdown-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
  }

  static async _onAddPip (event, element) {
    //console.log("add pip clicked")
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    //console.log("trackerRow", trackerRow);
    const id = trackerRow.dataset.id;
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    //console.log("_onAddPip data:", data);
    const thisTracker = data.find(t => t.id === id);
    if(!thisTracker) return;

    const updatedData = data.map(tracker => {
      if (tracker.id === id) {
        return {
          ...tracker,
          filled_cnt: Math.min(tracker.filled_cnt + 1, tracker.pip_cnt)
        };
      } else {
        return tracker
      }
    });
    //console.log("_onAddPip updatedData:", updatedData);
    await game.settings.set("progress-countdown-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { 
      game.settings.set("progress-countdown-tracker", "trackerDataChanged", true);
      game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" });  
      game.socket.emit("module.progress-countdown-tracker", { action: "showClientCollapsed" });
    }  
    game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
  }

  static async _onSubPip (event, element) {
    //console.log("sub pip clicked")
    const trackerRow = element.closest(".progress-countdown-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("progress-countdown-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    if(!thisTracker) return;

    const updatedData = data.map(tracker => {
      if (tracker.id === id) {
        return {
          ...tracker,
          filled_cnt: Math.max(tracker.filled_cnt - 1, 0)
        };
      } else {
        return tracker
      }
    });

    await game.settings.set("progress-countdown-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { 
      game.settings.set("progress-countdown-tracker", "trackerDataChanged", true);
      game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); 
      game.socket.emit("module.progress-countdown-tracker", { action: "showClientCollapsed" });
    }
    game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
  }

  _onRender(context, options) {
    super._onRender(context, options);

    const inactiveOpacity = game.settings.get("core", "inactiveOpacity");
    this.element.style.setProperty("--inactive-opacity", inactiveOpacity);
    
    // save position
    //const pos = this.position;
    //game.settings.set("progress-countdown-tracker", "trackerPosition", {
    //  top: pos.top,
    //  left: pos.left
    //});
    //console.log("top of onRender position:", game.settings.get("progress-countdown-tracker", "trackerPosition"));
 
    // re-ordering the trackers
    const appHtmlElement = this.element;
    const $trackerList = $(appHtmlElement).find(".progress-countdown-tracker-list");
    if ($trackerList.length) { // Ensure the element exists
      $trackerList.sortable({
        handle: ".progress-countdown-tracker-drag-handle",
        update: async (event, ui) => {
          // This is still within the callback, so you can make it async
          const newOrder = $trackerList.find(".progress-countdown-tracker-row").map((i, el) => el.dataset.id).get();
          await game.settings.set("progress-countdown-tracker", "trackerOrder", newOrder);
          // Might want to re-render here if the sort order affects other elements
          this.render(false); // Re-render without forcing a re-draw of the whole app
          game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
        }
      });
    } else {
      console.warn("DEBUG: Sortable container with class 'progress-countdown-tracker-list' NOT FOUND during _onRender!");
    }

    // editing the tracker names
    const editNameInputs = appHtmlElement.querySelectorAll(".progress-countdown-tracker-edit-name"); //this.element[0].querySelectorAll(".edit-name"); // this.element is a jQuery obj, get the native HTMLElement
    editNameInputs.forEach(input => {
      input.addEventListener("blur", async (event) => {
        await this._updateTrackerName(event);
        // this was moved lower to also allow for "Enter" to do something
        //const id = event.currentTarget.dataset.id;
        //const newName = event.currentTarget.value.trim();
        //const data = game.settings.get("progress-countdown-tracker", "trackerData");
        //const tracker = data.find(t => t.id === id);
        //if (tracker) {
        //  tracker.name = newName;
        //  await game.settings.set("progress-countdown-tracker", "trackerData", data);
        //  // UI to update visually based on name change, consider re-rendering
        //  this.render(false); 
        //  if(tracker.visible) { game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" }); }
        //  game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
        //}
      });
      input.addEventListener("keydown", async (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          await this._updateTrackerName(event);
          event.currentTarget.blur();
        }
      });
    });
    this._updateTrackerName = async (event) => {
      const id = event.currentTarget.dataset.id;
      const newName = event.currentTarget.value.trim();
      const data = game.settings.get("progress-countdown-tracker", "trackerData");
      const tracker = data.find(t => t.id === id);
      if (tracker) {
        tracker.name = newName;
        await game.settings.set("progress-countdown-tracker", "trackerData", data);
        this.render(false);
        if (tracker.visible) {
          game.socket.emit("module.progress-countdown-tracker", { action: "syncTrackerDataChanged" });
          game.socket.emit("module.progress-countdown-tracker", { action: "showClientCollapsed" });
        }
        game.socket.emit("module.progress-countdown-tracker", { action: "renderApplication" });
      }
    };

    // use selected font
    const selectedFont = game.settings.get("progress-countdown-tracker", "moduleFontFamily");
    const rootElement = this.element;
    rootElement.style.setProperty('--progress-countdown-tracker-font-family', selectedFont);
    
    // resize text input fields for GM and players
    let maxWidth = 50;
    const elementsToMeasure = rootElement.querySelectorAll(".progress-countdown-tracker-edit-name, .progress-countdown-tracker-display-name");
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.whiteSpace = "pre";
    document.body.appendChild(tempSpan);

    elementsToMeasure.forEach((element) => {
      const textContent = element.value || element.textContent;
      tempSpan.style.fontSize = getComputedStyle(element).fontSize;
      tempSpan.style.fontFamily = getComputedStyle(element).fontFamily;
      tempSpan.textContent = textContent;

      const currentWidth = tempSpan.offsetWidth;
      maxWidth = Math.max(maxWidth, currentWidth);
    });
    document.body.removeChild(tempSpan);
    maxWidth += 20;

    elementsToMeasure.forEach((element) => {
      element.style.width = `${maxWidth}px`;
    });

    // Make the window-content draggable
    const appEl = this.element;
    //console.log(appEl);
    if(!appEl) return;
    
    const handle = appEl.querySelector(".progress-countdown-tracker-topbar"); //.window-content");
    if(!handle) return;

    handle.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const rect = appEl.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const onMouseMove = (e) => {
        appEl.style.left = `${e.clientX - offsetX}px`;
        appEl.style.top = `${e.clientY - offsetY}px`;
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        // Save new position
        //console.log("saving position");
        game.settings.set("progress-countdown-tracker", "trackerPosition", {
          left: parseFloat(appEl.style.left),
          top: parseFloat(appEl.style.top)
        });
        this.setPosition({
          left: parseFloat(appEl.style.left),
          top: parseFloat(appEl.style.top)
        });
        //console.log("position:", game.settings.get("progress-countdown-tracker", "trackerPosition"));
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
    
  }

  // override default rendering to ensure correct position is kept
  /*async _renderFrame(options) {
    await super._renderFrame(options);
    const appEl = this.element;
    if(!appEl) return;
    const pos = game.settings.get("progress-countdown-tracker", "trackerPosition");
    if(pos?.left !== undefined && pos?.top !== undefined) {
      appEl.style.position = "absolute";
      appEl.style.left = `${pos.left}px`;
      appEl.style.top = `${pos.top}px`;
    }
  }*/

  // save position when window is moved
  /*async setPosition(position = {}) {
    const result = super.setPosition(position);
    const final = game.settings.get("progress-countdown-tracker", "trackerPosition"); //this.position;
    await game.settings.set("progress-countdown-tracker", "trackerPosition", final);
    console.log("setPosition position:", game.settings.get("progress-countdown-tracker", "trackerPosition"));
    this.setPosition({
      left: `${final.left}px`,
      top: `${final.top}px`,
      width: this.position.width,
      height: this.position.height
    });
    return result;
  }*/

}

Hooks.on("getSceneControlButtons", function(controls) {
  let tileControls = controls['tokens'];

  tileControls.tools['open-progress-trackers'] = {
    icon: 'fas fa-list-timeline',
    name: 'open-progress-trackers',
    title: 'Toggle Progress Trackers',
    //button: true,
    toggle: true,
    active: game.settings.get("progress-countdown-tracker", "trackerVisible") ?? false,
    onClick: (active) => {
      if(!game.pcTracker) {
        game.pcTracker = new ProgressCountdownTrackerApp();
      }
      if(active) { //!game.pcTracker.rendered) {
        game.pcTracker.render(true);
        game.settings.set("progress-countdown-tracker", "trackerVisible", true);
        //console.log(game.pcTracker.rendered);
        //console.log("visible setting:", game.settings.get("progress-countdown-tracker", "trackerVisible"));
      } else {
        game.pcTracker.close();
        game.settings.set("progress-countdown-tracker", "trackerVisible", false);
        //console.log(game.pcTracker.rendered);
        //console.log("visible setting:", game.settings.get("progress-countdown-tracker", "trackerVisible"));
      }
    },
    visible: true,
  };

});
