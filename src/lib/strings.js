export const tomlSample = `leader_key = "f18"

# launch apps
b = "Zen Browser"
# pass a list to rename long actions
v = ["Visual Studio Code", "VS Code"]
t = "Ghostty"

[a] # nest key sequences with groups
label = "[apps]" # name the group
t = "Todoist"
e = "https://gmail.com" # launch URLs
s = "Sketch"

[r] # use raycast deeplinks
label = "[raycast]"
e = ["raycast://extensions/raycast/emoji-symbols/search-emoji-symbols", "emoji"]
c = ["raycast://extensions/raycast/raycast/confetti", "confetti"]

[p]
label = "[prefixes]"
t = "text:sam@saml.dev" # types "sam@saml.dev"
z = "cmd:code ~/.zshrc" # run any terminal command
x = "code: ~/.zshrc"    # code: is shorthand for cmd:code
a = "shortcut:cmd a"    # trigger a keyboard shortcut
r = "reload"            # reserved for reloading your hammerspoon config (helpful when auto_reload is false)
`;
