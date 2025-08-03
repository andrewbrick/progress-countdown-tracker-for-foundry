
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
  
} // end init

  // Load position
  const pos = game.settings.get("fear-tracker", "miniTrackerPosition");
  tracker.style.top = pos.top; 
  tracker.style.left = pos.left; 
