export const tomlSample = `# settings
leader_key = "f18"        # required, the leader key that starts the sequence
leader_key_mods = ""      # optional, default "", not recommended - a dedicated leader key is better
                             # supports cmd ctrl alt shift
auto_reload = true        # optional, default true, reload when any file in this directory is saved
toast_on_reload =  false  # optional, default false, show a toast when the config is reloaded
show_ui = true            # optional, default true, show the ui with your key maps

# set a key to open an app
t = "Terminal"

# or a url
g = "https://google.com"

# use an array to change the label in the popup
v = ["Visual Studio Code", "VS Code"]

# create groups to nest actions
[l]
label = "[links]" # the "label" key is reserved to change the label of the group
g = "https://github.com"
b = "https://bsky.app"
t = "https://twitter.com"

# groups can be nested too!
[l.m]
label = "[me]"
g = ["https://github.com/saml-dev", "my github"]
b = ["https://bsky.app/profile/saml.dev", "my bluesky"]
t = ["https://twitter.com/saml_dev", "my twitter"]

# raycast deep links are supported toc
[r]
label = "[raycast]"
c = ["raycast://extensions/raycast/raycast/confetti", "confetti"]
e = ["raycast://extensions/raycast/emoji-symbols/search-emoji-symbols", "emoji"]

# use prefixes for special actions
[p]
label = "[prefixes]"
t = "text:sam@saml.dev" # types "sam@saml.dev"
z = "cmd:code ~/.zshrc" # run any terminal command
x = "code: ~/.zshrc"    # code: is shorthand for cmd:code
a = "shortcut:cmd a"    # trigger a keyboard shortcut
r = "reload"            # reserved for reloading your hammerspoon config (helpful when auto_reload is false)

# we have window management too!
[w]
label = "[window]"
h = "window:left-half"                    # use presets listed in the README
c = "window:center-half"                  # use presets listed in the README
l = ["window:.4,.3,.2,.4","small center"] # or use 4 percentages for x,y,width,height for custom placement - more details in README

# or use raycast for window management if you prefer
[w.r]
label = "[raycast-window]"
h = ["raycast://extensions/raycast/window-management/left-half", "left half"]
l = ["raycast://extensions/raycast/window-management/right-half", "right half"]
c = ["raycast://extensions/raycast/window-management/center-half", "center half"]

# this group is handy to copy over
# for quick access to your config
[h]
label = "[hammerspoon]"
d = ["https://www.hammerspoon.org/docs/index.html", "docs"]
c = "code: ~/.hammerspoon"
r = "reload" # reserved for reloading your hammerspoon config (helpful when auto_reload is false)

# glhf :) share your cool ideas with me on
# twitter @saml_dev - <leader> l m t
# bluesky @saml.dev - <leader> l m b
# github saml-dev   - <leader> l m g

# for advanced hammerspoon users, you can use
# the hs: prefix as an escape hatch to run any
# hammerspoon command you want.
[z]
z = "hs:hs.alert('Hello, world!')"
`;
