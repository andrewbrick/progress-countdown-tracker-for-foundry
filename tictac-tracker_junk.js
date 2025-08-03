export class TrackerApp extends PIXI.Container {
  constructor(trackers) {
    super();
    this.trackers = trackers;
    this.interactive = true;
    this.position.set(120, 120); // Initial position

    this._build();
  }

  _build() {
    this.removeChildren();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x0, 0.5);
    bg.drawRoundedRect(0, 0, 200, 100 + this.trackers.length * 30, 10);
    bg.endFill();
    this.addChild(bg);

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: '#ffffff'
    });

    this.trackers.forEach((tracker, i) => {
      const label = new PIXI.Text(`${tracker.name}: ${tracker.value}`, style);
      label.x = 10;
      label.y = 10 + i * 30;
      this.addChild(label);
    });
  }

  /**
   * Rebuild the PIXI elements when trackers are updated
   */
  updateTrackers(newTrackers) {
    this.trackers = newTrackers;
    this._build();
  }

  /**
   * Add to canvas.stage and re-position if needed
   */
  attachToCanvas() {
    if (!canvas.stage.children.includes(this)) {
      canvas.stage.addChild(this);
    }
  }

  /**
   * Called when canvas is resized or manually positioned
   */
  setPosition(position = {}) {
    const { left = this.position.x, top = this.position.y } = position;
    this.position.set(left, top);
  }
}

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
      reRender();
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
      reRender();
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
      reRender();
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
      reRender();
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
  
}); // end init

Hooks.once('ready', () => {

  const widget = new TrackerApp([
    { name: 'Health', value: 42 },
    { name: 'Sanity', value: 13 },
  ]);
  widget.attachToCanvas();

  new TrackerApp().render(true);
  
  // Load position
  //const pos = game.settings.get("tictac-tracker", "trackerPosition");
  //tracker.style.top = pos.top; 
  //tracker.style.left = pos.left; 

});

class TrackerApp extends foundry.applications.api.ApplicationV2 {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "trackers-app",
      template: "modules/tictac-tracker/templates/trackers.html",
      popOut: true,
      resizeable: false,
      title: "Trackers",
      width: 500,
      height: "auto",
      classes: ["trackers-window"]
    });
  }

  //async _renderHTML() {
  //  const data = await this.getData();
  //  const html = await renderTemplate("modules/trackers/templates/trackers.html", data);
  //  return html;
  //}

  //async _replaceHTML(container, html) {
  //  container.innerHTML = html;
  //  this._element = $(container);
  //  this.activateListeners(this._element);
  //}

  async _renderHTML() {
    const html = await foundry.applications.handlebars.renderTemplate(this.options.template, await this.getContext());
    return html;
  }

  async _replaceHTML(element, html) {
    element.innerHTML = html;
  }

  async data() {
    const data = game.settings.get("tictac-tracker", "trackerData");
    const collapsed = game.settings.get("tictac-tracker", "collapsed");
    const order = game.settings.get("tictac-tracker", "trackerOrder");
    const isGM = game.user.isGM;

    // Apply saved ordering
    const ordered = order
      .map(id => data.find(t => t.id == id))
      .filter(Boolean);

    const unordered = data.filter(t => !order.includes(t.id));
    const fullList = [...ordered, ...unordered];

    return {
      isGM,
      collapsed,
      progressColor: game.settings.get("tictac-tracker", "progressPipColor"),
      consequenceColor: game.settings.get("tictac-tracker", "consequencePipColor"),
      trackers: fullList
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const self = this;

    html.find(".toggle-collapse").on("click", async () => {
      const current = game.settings.get("tictac-tracker", "collapsed");
      await game.settings.set("tictac-tracker", "collapsed", !current);
      this.render();
    });

    html.find(".add-tracker").on("click", async () => {
      const data = game.settings.get("tictac-tracker", "trackerData");
      const order = game.settings.get("tictac-tracker", "trackerOrder");
      let base = "New Tracker";
      let i = 0 ;
      let name;
      do {
        name = base + (i ? ` ${i}` : "");
        i++;
      } while (data.find(t => t.name === name));

      const id = randomID();
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
    });

    html.find(".delete-tracker").on("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      let data = game.settings.get("tictac-tracker", "trackerData");
      let order = game.settings.get("tictac-tracker", "trackerOrder");
      data = data.filter(t => t.id !== id);
      order = order.filter(i => i !== id);
      await game.settings.set("tictac-tracker", "trackerData", data);
      await game.settings.set("tictac-tracker", "trackerOrder", order);
      this.render();
    });

    html.find(".edit-name").on("blur", async (event) => {
      const id = event.currentTarget.dataset.id;
      const newName = event.currentTarget.value.trim();
      const data = game.settings.get("tictac-tracker", "trackerData");
      const tracker = data.find(t => t.id === id);
      if(tracker) {
        tracker.name = newName;
        await game.settings.set("tictac-tracker", "trackerData", data);
      }
    });

    html.find(".toggle-type").on("click", async (event) => {
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

    html.find(".toggle-visibility").on("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      const data = game.settings.get("tictac-tracker", "trackerData");
      const tracker = data.find(t => t.id === id);
      if(tracker) {
        tracker.visible = !tracker.visible;
        await game.settings.set("tictac-tracker", "trackerData", data);
        this.render();
      }
    });

    html.find(".pip-mod").on("click", async (event) => {
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

    html.find(".tracker-list").sortable({
      handle: ".drag-handle",
      update: async (event, ui) => {
        const newOrder = html.find(".tracker-row").map((i, el) => el.dataset.id).get();
        await game.settings.set("tictac-tracker", "trackerOrder", newOrder);
      }
    });
  }
}

function randomId() {
  return randomId = foundry.utils.randomID(16);
}
