Hooks.once("init", () => {

  // progress pip character
  game.settings.register("tictac-tracker", "progressPipCharacter", {
    name: "Progress Pip Character",
    hint: "Change the pip character for progress trackers (use one character only). Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    default: "\u25CF", // unicode black circle
    onChange: async (value) => {
      // Validate single char
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        ui.notifications.warn("Progress Pip Character is blank. Using default.");
        await game.settings.set("tictac-tracker", "progressPipCharacter", "●");
      } else if (trimmed.length > 1) {
        const firstChar = trimmed.charAt(0);
        ui.notifications.warn("You must enter exactly one character. Using only the first character.");
        await game.settings.set("tictac-tracker", "progressPipCharacter", firstChar);
      }
      game.tictacTracker.render(true); //reRender();
    }
  });
  
  // consequence pip character
  game.settings.register("tictac-tracker", "consequencePipCharacter", {
    name: "Consequence Pip Character",
    hint: "Change the pip character for consequence trackers (use one character only). Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    default: "\u25CF", // unicode black circle
    onChange: async (value) => {
      // Validate single char
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        ui.notifications.warn("Consequence Pip Character field is blank. Using default.");
        await game.settings.set("tictac-tracker", "consequencePipCharacter", "●");
      } else if (trimmed.length > 1) {
        const firstChar = trimmed.charAt(0);
        ui.notifications.warn("You must enter exactly one character. Using only the first character.");
        await game.settings.set("tictac-tracker", "consequencePipCharacter", firstChar);
      }
      game.tictacTracker.render(true); //reRender();
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
      game.tictacTracker.render(true); //reRender();
    }
  });

  // consequence pip color
  game.settings.register("tictac-tracker", "consequencePipColor", {
    name: "Progress Pip Color",
    hint: "Change the color of active pips for consequence trackers. Applies only to you.",
    scope: "client",
    config: true,
    type: new game.colorPicker.ColorPickerField(),
    default: "#A02B93",
    onChange: () => {
      game.tictacTracker.render(true); //reRender();
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

  Handlebars.registerHelper("range", function(n, block) {
    let accum = '';
    for (let i = 0; i < n; ++i) accum += block.fn(i);
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
  
}); // end init

Hooks.once('ready', async () => {
  
  game.tictacTracker = new TrackerApp();
  await game.tictacTracker.render(true);
  //new TrackerApp().render(true);
  console.log("DEBUG: foundry object available:", typeof foundry);
  console.log("DEBUG: foundry.applications.api available:", typeof foundry?.applications?.api);
  console.log("DEBUG: HandlebarsApplicationMixin available:", typeof foundry?.applications?.api?.HandlebarsApplicationMixin);
  console.log("DEBUG: ApplicationV2 available:", typeof foundry?.applications?.api?.ApplicationV2);
  console.log("DEBUG: TrackerApp Instance Options:", game.tictacTracker.options);
  console.log("DEBUG: TrackerApp Instance Frame Options:", game.tictacTracker.options.frame); // Check if frame options are inherited/set
  console.log("DEBUG: TrackerApp Instance HTML Element:", game.tictacTracker.element); // Check the element reference
  console.log("DEBUG: Does TrackerApp have _onRender method?", typeof game.tictacTracker._onRender); // Should be 'function'
  console.log("num trackers:", game.settings.get("tictac-tracker", "trackerData").length);
  
  // Load position
  //const pos = game.settings.get("tictac-tracker", "trackerPosition");
  //tracker.style.top = pos.top; 
  //tracker.style.left = pos.left; 

});

//const { HandlebarsApplicationMixin } = foundry.applications.api;

class TrackerApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) { //HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = { //static get defaultOptions() {
    //return foundry.utils.mergeObject(super.defaultOptions, {
    id: "trackers-app",
    template: "modules/tictac-tracker/templates/trackers.html",
    popOut: true,
    resizeable: false,
    window: {
      title: "Trackers",
    },
    position: {
      width: 500,
      height: "auto"
    },
    classes: ["trackers-window"],
    actions: {
      addTracker: TrackerApp._onAddTracker,
      delTracker: TrackerApp._onDelTracker,
      addPipCont: TrackerApp._onAddPipCont, // add a pip to the tracker
      subPipCont: TrackerApp._onSubPipCont, // subtract a pip from the tracker
      addPip: TrackerApp._onAddPip, // color in the next pip in the tracker
      subPip: TrackerApp._onSubPip, // gray out the next pip in the tracker
      toggleType: TrackerApp._onToggleType, // toggle between consequence and progress
      toggleVis: TrackerApp._onToggleVis, // toggle visibility of the tracker
      //moveTracker: TrackerApp._onMoveTracker, // grab one tracker and re-position it within the list
      collapseTrackers: TrackerApp._onCollapseTrackers // toggle to collapse / expand the tracker bars
      //editTrackerName: TrackerApp._onEditTrackerName
    }
  } //);

  async _prepareContext(options) {
    const data = game.settings.get("tictac-tracker", "trackerData");
    const collapsed = game.settings.get("tictac-tracker", "collapsed");
    const order = game.settings.get("tictac-tracker", "trackerOrder");
    const isGM = game.user.isGM;
    console.log("isGM _prepareContext:", isGM);

    // Apply saved ordering
    const ordered = order
      .map(id => data.find(t => t.id == id))
      .filter(Boolean);

    const unordered = data.filter(t => !order.includes(t.id));
    const fullList = [...ordered, ...unordered];

    console.log("_prepareContext return:", {
      isGM,
      collapsed: collapsed,
      progressColor: game.settings.get("tictac-tracker", "progressPipColor"),
      consequenceColor: game.settings.get("tictac-tracker", "consequencePipColor"),
      trackers: fullList
    });

    return {
      isGM,
      collapsed: collapsed,
      progressColor: game.settings.get("tictac-tracker", "progressPipColor"),
      consequenceColor: game.settings.get("tictac-tracker", "consequencePipColor"),
      trackers: fullList
    };
  }

  async _renderHTML(context, options) {
    //const html = await foundry.applications.handlebars.renderTemplate(this.options.template, await this.getData());
    console.log("_renderHTML context:", context);
    const html = await foundry.applications.handlebars.renderTemplate("modules/tictac-tracker/templates/trackers.html", context); //this.getData()); //this.getData()); //context);
    //const template = document.createElement("template");
    //template.innerHTML = html.trim();
    //return template.content.firstElementChild;
    console.log("isGM:", context.isGM);
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
    console.log("add tracker clicked");
  
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
    this.render()
  }

  static async _onDelTracker(event, element) {
    console.log("delete tracker clicked")
    const trackerRow = element.closest(".tracker-row");
    const id = trackerRow.dataset.id;
    let data = game.settings.get("tictac-tracker", "trackerData");
    let order = game.settings.get("tictac-tracker", "trackerOrder");
    data = data.filter(t => t.id !== id);
    order = order.filter(i => i !== id);
    await game.settings.set("tictac-tracker", "trackerData", data);
    await game.settings.set("tictac-tracker", "trackerOrder", order);
    this.render();
  }

  static async _onCollapseTrackers(event, element) {
    console.log("collapse/expand toggle clicked")
    const current = game.settings.get("tictac-tracker", "collapsed");
    await game.settings.set("tictac-tracker", "collapsed", !current);
    this.render();
  }

  static async _onToggleType(event, element) { // .toggle-type
    const id = event.currentTarget.dataset.id;
    const type = event.currentTarget.dataset.type;
    const data = game.settings.get("tictac-tracker", "trackerData");
    const tracker = data.find(t => t.id === id);
    if(tracker && tracker.type !== type) {
      tracker.type = type;
      await game.settings.set("tictac-tracker", "trackerData", data);
      this.render();
    }
  }

  static async _onToggleVis(event, element) { //.toggle-visibility
    const id = event.currentTarget.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
    const tracker = data.find(t => t.id === id);
    if(tracker) {
      tracker.visible = !tracker.visible;
      await game.settings.set("tictac-tracker", "trackerData", data);
      this.render();
    }
  }

  static async _onAddPipCont(event, element) {
    console.log("add pip container clicked")
    const trackerRow = element.closest(".tracker-row");
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
      }
    });
    
    //if (tracker.pip_cnt < 24) {
    //  tracker.pip_cnt++;
    //}
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
  }

  static async _onSubPipCont(event, element) {
    console.log("sub pip container clicked")
    const trackerRow = element.closest(".tracker-row");
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
      }
    });
    
    //if (tracker.pip_cnt > 1) {
    //  tracker.pip_cnt--;
    //  if (tracker.filled_cnt > tracker.pip_cnt) tracker.filled_cnt = tracker.pip_cnt;
    //}
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
  }

  static async _onAddPip (event, element) {
    console.log("add pip clicked")
    const trackerRow = element.closest(".tracker-row");
    const id = trackerRow.dataset.id;
    const data = game.settings.get("tictac-tracker", "trackerData");
    console.log("_onAddPip data:", data);
    const thisTracker = data.find(t => t.id === id);
    if(!thisTracker) return;

    const updatedData = data.map(tracker => {
      if (tracker.id === id) {
        return {
          ...tracker,
          filled_cnt: Math.min(tracker.filled_cnt + 1, tracker.pip_cnt)
        };
      }
    });
    console.log("_onAddPip data:", updatedData);
    //if (tracker.filled_cnt < tracker.pip_cnt) tracker.filled_cnt++;
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
  }

  static async _onSubPip (event, element) {
    console.log("sub pip clicked")
    const trackerRow = element.closest(".tracker-row");
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
      }
    });

    //if (tracker.filled_cnt > 0) tracker.filled_cnt--;
    await game.settings.set("tictac-tracker", "trackerData", updatedData);
    this.render();
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

    // re-ordering the trackers
    const appHtmlElement = this.element;
    const $trackerList = $(appHtmlElement).find(".tracker-list");
    if ($trackerList.length) { // Ensure the element exists
      $trackerList.sortable({
        handle: ".drag-handle",
        update: async (event, ui) => {
          // This is still within the callback, so you can make it async
          const newOrder = $trackerList.find(".tracker-row").map((i, el) => el.dataset.id).get();
          await game.settings.set("tictac-tracker", "trackerOrder", newOrder);
          // Might want to re-render here if the sort order affects other elements
          this.render(false); // Re-render without forcing a re-draw of the whole app
        }
      });
    } else {
      console.warn("DEBUG: Sortable container with class 'tracker-list' NOT FOUND during _onRender!");
    }

    // editing the tracker names
    const editNameInputs = appHtmlElement.querySelectorAll(".edit-name"); //this.element[0].querySelectorAll(".edit-name"); // this.element is a jQuery obj, get the native HTMLElement
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
        }
      });
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

