Hooks.once("init", () => {
  // progress pip character
  game.settings.register("tictac-tracker", "progressPipCharacter", {
    name: "Progress Pip Character",
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
        await game.settings.set("tictac-tracker", "progressPipCharacter", "●");
      } else if (trimmed.length > 1) {
        const firstChar = trimmed.charAt(0);
        ui.notifications.warn("You must enter exactly one character. Using only the first character.");
        await game.settings.set("tictac-tracker", "progressPipCharacter", firstChar);
      }*/
      game.tictacTracker.render(true); 
    }
  });
  
  // consequence pip character
  game.settings.register("tictac-tracker", "consequencePipCharacter", {
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
        await game.settings.set("tictac-tracker", "consequencePipCharacter", "●");
      } else if (trimmed.length > 1) {
        const firstChar = trimmed.charAt(0);
        ui.notifications.warn("You must enter exactly one character. Using only the first character.");
        await game.settings.set("tictac-tracker", "consequencePipCharacter", firstChar);
      }*/
      game.tictacTracker.render(true); 
    }
  });

  // progress pip color
  game.settings.register("tictac-tracker", "progressPipColor", {
    name: "Progress Pip Color",
    hint: "Change the color of active pips for progress trackers. Applies only to you.",
    scope: "client",
    config: true,
    type: new game.colorPicker.ColorPickerField(),
    default: "#A02B93",
    onChange: () => {
      game.tictacTracker.render(true); 
    }
  });

  // consequence pip color
  game.settings.register("tictac-tracker", "consequencePipColor", {
    name: "Consequence Pip Color",
    hint: "Change the color of active pips for consequence trackers. Applies only to you.",
    scope: "client",
    config: true,
    type: new game.colorPicker.ColorPickerField(),
    default: "#A02B93",
    onChange: () => {
      game.tictacTracker.render(true); 
    }
  });

  // keep track of the tracker's position
  game.settings.register("tictac-tracker", "trackerPosition", {
    name: "Tracker Position",
    scope: "client",
    config: false,
    type: Object,
    default: {top:100, left:100}
  });

  // store collapsed state
  game.settings.register("tictac-tracker", "collapsed", {
    name: "Collapsed",
    scope: "client",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("tictac-tracker", "trackerOrder", {
    name: "Tracker Order",
    scope: "client",
    config: false,
    type: Array,
    default: []
  });

  game.settings.register("tictac-tracker", "trackerData", {
    name: "Tracker Data",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });

  game.settings.register("tictac-tracker", "trackerDataChanged", { // store whether trackerData has changed since user collapsed the trackers
    name: "Tracker Data Changed Tracker",
    scope: "client",
    config: false,
    type: Boolean,
    default: false
  });

  Handlebars.registerHelper("range", function(n, block) {
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
  game.settings.register("tictac-tracker", "moduleFontFamily", {
    name: "Module Font Family",
    hint: "Select a font for use by this module. Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    choices: fontChoices,
    default: "Arial, sans-serif",
    onChange: () => {
      game.tictacTracker.render(true); 
    }
  });

  // Module init
  game.tictacTracker = new TictacTrackerApp();
  await game.tictacTracker.render(true);

  //console.log("DEBUG: foundry object available:", typeof foundry);
  //console.log("DEBUG: foundry.applications.api available:", typeof foundry?.applications?.api);
  //console.log("DEBUG: HandlebarsApplicationMixin available:", typeof foundry?.applications?.api?.HandlebarsApplicationMixin);
  //console.log("DEBUG: ApplicationV2 available:", typeof foundry?.applications?.api?.ApplicationV2);
  //console.log("DEBUG: TictacTrackerApp Instance Options:", game.tictacTracker.options);
  //console.log("DEBUG: TictacTrackerApp Instance Frame Options:", game.tictacTracker.options.frame); // Check if frame options are inherited/set
  //console.log("DEBUG: TictacTrackerApp Instance HTML Element:", game.tictacTracker.element); // Check the element reference
  //console.log("DEBUG: Does TictacTrackerApp have _onRender method?", typeof game.tictacTracker._onRender); // Should be 'function'
  //console.log("num trackers:", game.settings.get("tictac-tracker", "trackerData").length);

  // Re-render socket
  game.socket.on("module.tictac-tracker", (payload) => {
    if (payload.action === "renderApplication") {
      //console.log("payload.action is renderApplication");
      const applicationInstance = foundry.applications.instances.get("tictac-tracker");
      //console.log("applicationInstance", applicationInstance);
      if (applicationInstance) {
        //console.log("applicationInstance exists");
        applicationInstance.render(true);
      }
    }
    // trackerDataChanged force client update
    if (payload.action === "syncTrackerDataChanged") {
      const collapsed = game.settings.get("tictac-tracker", "collapsed");
      if (collapsed) {
        game.settings.set("tictac-tracker", "trackerDataChanged", true);
      }
    }
    // GM forceUncollapse force client update
    if (payload.action === "forceUncollapse") {
      game.settings.set("tictac-tracker", "collapsed", false);
    }
  });  
  
});

class TictacTrackerApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) { //HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  
  static get DEFAULT_OPTIONS() {
    const storedPosition = game.settings.get("tictac-tracker", "trackerPosition");
    const baseOptions = super.DEFAULT_OPTIONS;
    const customOptions = {
      id: "tictac-tracker",
      template: "modules/tictac-tracker/templates/trackers.html",
      popOut: true,
      resizeable: false,
      window: {
        title: "Trackers",
      },
      position: {
        top: storedPosition.top,
        left: storedPosition.left,
        width: "auto",
        height: "auto"
      },
      classes: ["tictac-trackers-window"],
      actions: {
        addTracker: TictacTrackerApp._onAddTracker,
        delTracker: TictacTrackerApp._onDelTracker,
        addPipCont: TictacTrackerApp._onAddPipCont, // add a pip to the tracker
        subPipCont: TictacTrackerApp._onSubPipCont, // subtract a pip from the tracker
        addPip: TictacTrackerApp._onAddPip, // color in the next pip in the tracker
        subPip: TictacTrackerApp._onSubPip, // gray out the next pip in the tracker
        toggleType: TictacTrackerApp._onToggleType, // toggle between consequence and progress
        changeToProg: TictacTrackerApp._onChangeToProg,
        changeToCons: TictacTrackerApp._onChangeToCons,
        toggleVis: TictacTrackerApp._onToggleVis, // toggle visibility of the tracker
        //moveTracker: TictacTrackerApp._onMoveTracker, // grab one tracker and re-position it within the list
        collapseTrackers: TictacTrackerApp._onCollapseTrackers // toggle to collapse / expand the tracker bars
        //editTrackerName: TictacTrackerApp._onEditTrackerName
      }
    }
    return foundry.utils.mergeObject(baseOptions, customOptions);
  }
  
  /*
  static DEFAULT_OPTIONS = { //static get defaultOptions() {
    id: "tictac-tracker",
    template: "modules/tictac-tracker/templates/trackers.html",
    popOut: true,
    resizeable: false,
    window: {
      title: "Trackers",
    },
    position: {
      width: "auto",
      height: "auto"
    },
    classes: ["tictac-trackers-window"],
    actions: {
      addTracker: TictacTrackerApp._onAddTracker,
      delTracker: TictacTrackerApp._onDelTracker,
      addPipCont: TictacTrackerApp._onAddPipCont, // add a pip to the tracker
      subPipCont: TictacTrackerApp._onSubPipCont, // subtract a pip from the tracker
      addPip: TictacTrackerApp._onAddPip, // color in the next pip in the tracker
      subPip: TictacTrackerApp._onSubPip, // gray out the next pip in the tracker
      toggleType: TictacTrackerApp._onToggleType, // toggle between consequence and progress
      changeToProg: TictacTrackerApp._onChangeToProg,
      changeToCons: TictacTrackerApp._onChangeToCons,
      toggleVis: TictacTrackerApp._onToggleVis, // toggle visibility of the tracker
      //moveTracker: TictacTrackerApp._onMoveTracker, // grab one tracker and re-position it within the list
      collapseTrackers: TictacTrackerApp._onCollapseTrackers // toggle to collapse / expand the tracker bars
      //editTrackerName: TictacTrackerApp._onEditTrackerName
    }
  }
  */

  async _prepareContext(options) {
    const data = game.settings.get("tictac-tracker", "trackerData");
    const collapsed = game.settings.get("tictac-tracker", "collapsed");
    const order = game.settings.get("tictac-tracker", "trackerOrder");
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
      progressColor: game.settings.get("tictac-tracker", "progressPipColor"),
      consequenceColor: game.settings.get("tictac-tracker", "consequencePipColor"),
      trackers: fullList
    });
    */

    // Get max pip count of any tracker bar (so all bars can be uniform)
    let maxPips = 0;
    for (const tracker of data) {
      if (tracker.pip_cnt > maxPips) {
        maxPips = tracker.pip_cnt;
      }
    }

    // Get pip characters
    const progressPipChar = game.settings.get("tictac-tracker", "progressPipCharacter");
    const consequencePipChar = game.settings.get("tictac-tracker", "consequencePipCharacter");
    // Are they font awesome icons?
    //const progIsFa = (progressPipChar.includes('fa-') || progressPipChar.startsWith('fas '))
    //const consIsFa = (consequencePipChar.includes('fa-') || consequencePipChar.startsWith('fas '))

    return {
      isGM,
      collapsed: collapsed,
      //collapsed: finalCollapsed,
      progressColor: game.settings.get("tictac-tracker", "progressPipColor"),
      consequenceColor: game.settings.get("tictac-tracker", "consequencePipColor"),
      trackers: fullList,
      maxPips: maxPips,
      progressPipChar: progressPipChar,
      consequencePipChar: consequencePipChar
      //progIsFa: progIsFa,
      //consIsFa: consIsFa
    };
  }

  async _renderHTML(context, options) {
    //const html = await foundry.applications.handlebars.renderTemplate(this.options.template, await this.getData());
    //console.log("_renderHTML context:", context);
    const html = await foundry.applications.handlebars.renderTemplate("modules/tictac-tracker/templates/trackers.html", context); //this.getData()); //this.getData()); //context);
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
  
    const data = game.settings.get("tictac-tracker", "trackerData");
    const order = game.settings.get("tictac-tracker", "trackerOrder");
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

    await game.settings.set("tictac-tracker", "trackerData", data);
    await game.settings.set("tictac-tracker", "trackerOrder", order);
    this.render();
    game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
  }

  static async _onDelTracker(event, element) {
    //console.log("delete tracker clicked")
    const trackerRow = element.closest(".tictac-tracker-row");
    const id = trackerRow.dataset.id;
    let data = game.settings.get("tictac-tracker", "trackerData");
    const thisTracker = data.find(t => t.id === id);
    let order = game.settings.get("tictac-tracker", "trackerOrder");
    data = data.filter(t => t.id !== id);
    order = order.filter(i => i !== id);
    await game.settings.set("tictac-tracker", "trackerData", data);
    await game.settings.set("tictac-tracker", "trackerOrder", order);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
  }

  static async _onCollapseTrackers(event, element) {
    //console.log("collapse/expand toggle clicked")
    const current = game.settings.get("tictac-tracker", "collapsed");
    if (current) { // if the tracker is collapsed, clear trackerDataChanged (b/c the user is now expanding it)
      game.settings.set("tictac-tracker", "trackerDataChanged", false);
    }
    await game.settings.set("tictac-tracker", "collapsed", !current);
    this.render();
  }

  static async _onChangeToProg(event, element) { 
    const trackerRow = element.closest(".tictac-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
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
      await game.settings.set("tictac-tracker", "trackerData", updatedData);
      this.render();
      if(thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
      game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
    }
  }

  static async _onChangeToCons(event, element) { 
    const trackerRow = element.closest(".tictac-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
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
      await game.settings.set("tictac-tracker", "trackerData", updatedData);
      this.render();
      if(thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
      game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
    }
  }
    
  static async _onToggleVis(event, element) { //.toggle-visibility
    const trackerRow = element.closest(".tictac-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
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
    
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
    //if(!thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
    if(!thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "forceUncollapse" }); }
    game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
  }

  static async _onAddPipCont(event, element) {
    //console.log("add pip container clicked")
    const trackerRow = element.closest(".tictac-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
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
    
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
  }

  static async _onSubPipCont(event, element) {
    //console.log("sub pip container clicked")
    const trackerRow = element.closest(".tictac-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
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
    
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
  }

  static async _onAddPip (event, element) {
    //console.log("add pip clicked")
    const trackerRow = element.closest(".tictac-tracker-row");
    //console.log("trackerRow", trackerRow);
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
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
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
  }

  static async _onSubPip (event, element) {
    //console.log("sub pip clicked")
    const trackerRow = element.closest(".tictac-tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
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

    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
    if(thisTracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
    game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
  }

  /*
  static async _onPipMod (event, element) { //.pip-mod
    const id = event.currentTarget.dataset.id;
    const action = event.currentTarget.dataset.action;
    const data = game.settings.get("tictac-tracker", "trackerData");
    const tracker = data.find(t => t.id === id);
    if(!tracker) return;

    if (action === "pip--" && tracker.filled_cnt > 0) tracker.filled_cnt--;
    else if (action === "pip++" && tracker.filled_cnt < tracker.pip_cnt) tracker.filled_cnt++;
    else if (action === "cnt--" && tracker.pip_cnt > 1) {
      tracker.pip_cnt--;
      if (tracker.filled_cnt > tracker.pip_cnt) tracker.filled_cnt = tracker.pip_cnt;
    } else if (action === "cnt++" && tracker.pip_cnt < 24) {
      tracker.pip_cnt++;
    }

    await game.settings.set("tictac-tracker", "trackerData", data);
    this.render();
  }
  */

  _onRender(context, options) {
    super._onRender(context, options);

    // save position
    const pos = this.position;
    game.settings.set("tictac-tracker", "trackerPosition", {
      top: pos.top,
      left: pos.left
    });
 
    // re-ordering the trackers
    const appHtmlElement = this.element;
    const $trackerList = $(appHtmlElement).find(".tictac-tracker-list");
    if ($trackerList.length) { // Ensure the element exists
      $trackerList.sortable({
        handle: ".tictac-drag-handle",
        update: async (event, ui) => {
          // This is still within the callback, so you can make it async
          const newOrder = $trackerList.find(".tictac-tracker-row").map((i, el) => el.dataset.id).get();
          await game.settings.set("tictac-tracker", "trackerOrder", newOrder);
          // Might want to re-render here if the sort order affects other elements
          this.render(false); // Re-render without forcing a re-draw of the whole app
          game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
        }
      });
    } else {
      console.warn("DEBUG: Sortable container with class 'tictac-tracker-list' NOT FOUND during _onRender!");
    }

    // editing the tracker names
    const editNameInputs = appHtmlElement.querySelectorAll(".tictac-edit-name"); //this.element[0].querySelectorAll(".edit-name"); // this.element is a jQuery obj, get the native HTMLElement
    editNameInputs.forEach(input => {
      input.addEventListener("blur", async (event) => {
        const id = event.currentTarget.dataset.id;
        const newName = event.currentTarget.value.trim();
        const data = game.settings.get("tictac-tracker", "trackerData");
        const tracker = data.find(t => t.id === id);
        if (tracker) {
          tracker.name = newName;
          await game.settings.set("tictac-tracker", "trackerData", data);
          // UI to update visually based on name change, consider re-rendering
          this.render(false); 
          if(tracker.visible) { game.socket.emit("module.tictac-tracker", { action: "syncTrackerDataChanged" }); }
          game.socket.emit("module.tictac-tracker", { action: "renderApplication" });
        }
      });
    });

    // use selected font
    const selectedFont = game.settings.get("tictac-tracker", "moduleFontFamily");
    const rootElement = this.element;
    rootElement.style.setProperty('--tictac-font-family', selectedFont);
    
    // resize text input fields for GM and players
    let maxWidth = 50;
    const elementsToMeasure = rootElement.querySelectorAll(".tictac-edit-name, .tictac-display-name");
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
    
  }
  
// Old activateListeners    
/*
    html.querySelector(".edit-name").on("blur", async (event) => {
      const id = event.currentTarget.dataset.id;
      const newName = event.currentTarget.value.trim();
      const data = game.settings.get("tictac-tracker", "trackerData");
      const tracker = data.find(t => t.id === id);
      if(tracker) {
        tracker.name = newName;
        await game.settings.set("tictac-tracker", "trackerData", data);
      }
    });
    
    html.querySelector(".toggle-type").on("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      const type = event.currentTarget.dataset.type;
      const data = game.settings.get("tictac-tracker", "trackerData");
      const tracker = data.find(t => t.id === id);
      if(tracker && tracker.type !== type) {
        tracker.type = type;
        await game.settings.set("tictac-tracker", "trackerData", data);
        this.render();
      }
    });

    html.querySelector(".toggle-visibility").on("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      const data = game.settings.get("tictac-tracker", "trackerData");
      const tracker = data.find(t => t.id === id);
      if(tracker) {
        tracker.visible = !tracker.visible;
        await game.settings.set("tictac-tracker", "trackerData", data);
        this.render();
      }
    });
    

    html.querySelector(".pip-mod").on("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      const action = event.currentTarget.dataset.action;
      const data = game.settings.get("tictac-tracker", "trackerData");
      const tracker = data.find(t => t.id === id);
      if(!tracker) return;

      if (action === "pip--" && tracker.filled_cnt > 0) tracker.filled_cnt--;
      else if (action === "pip++" && tracker.filled_cnt < tracker.pip_cnt) tracker.filled_cnt++;
      else if (action === "cnt--" && tracker.pip_cnt > 1) {
        tracker.pip_cnt--;
        if (tracker.filled_cnt > tracker.pip_cnt) tracker.filled_cnt = tracker.pip_cnt;
      } else if (action === "cnt++" && tracker.pip_cnt < 24) {
        tracker.pip_cnt++;
      }

      await game.settings.set("tictac-tracker", "trackerData", data);
      this.render();
    });
    

    html.querySelector(".tracker-list").sortable({
      handle: ".drag-handle",
      update: async (event, ui) => {
        const newOrder = html.find(".tracker-row").map((i, el) => el.dataset.id).get();
        await game.settings.set("tictac-tracker", "trackerOrder", newOrder);
      }
    });
    
    
  } // end activate listeners
  */
}

