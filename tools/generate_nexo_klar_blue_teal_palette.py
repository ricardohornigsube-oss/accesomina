from pathlib import Path

SOURCE = Path('/Users/ricardo.hornig/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/CE6FE5B8-9318-42D5-A676-BF4DFCD7C8C0/Nexo Klar - Pulso - Taller de cierre.html')
DESTINATION = Path('/Users/ricardo.hornig/Desktop/Nexo Klar/Nexo Klar - Sistema de color - Azul Nexo y Turquesa.html')
REPO_COPY = Path('/Users/ricardo.hornig/Desktop/Acceso Mina /Acceso Mina/docs/Nexo Klar - Sistema de color - Azul Nexo y Turquesa.html')

# Brand palette inspired by the approved mark: deep blue structure, electric blue hierarchy,
# teal action, and cool-white surfaces. Replacements preserve the workshop's interactivity.
PALETTE = {
    '#2A2A8C': '#071B4A',  # primary navy
    '#1A1A5E': '#031131',  # deep navy
    '#1E3AE0': '#1358C8',  # electric blue
    '#5B7BFF': '#5E91EA',  # light blue
    '#00CFC1': '#00B8B0',  # turquoise
    '#00706A': '#087E7B',  # deep turquoise
    '#0B3B3A': '#0A4547',  # petroleum
    '#26313A': '#263445',  # graphite blue
    '#141A20': '#081225',  # ink
    '#E9A319': '#2C79DF',  # blue signal (replaces amber)
    '#FF5A3C': '#4B6BC5',  # indigo signal (replaces coral)
    '#E4006E': '#4072DA',  # blue accent (replaces magenta)
    '#C7D0D6': '#CAD6E4',  # metal blue
    '#F4EFE3': '#F6F8FC',  # cool surface
    '#FBF9F5': '#FCFDFE',  # white surface
    '#E3DED2': '#E0E7F0',  # border soft
    '#DCD5C6': '#D8E1EC',  # border
    '#EAE4D6': '#EEF3F8',  # pale blue
    '#8A96A1': '#65758B',  # muted text
    '#5D6B7A': '#52637B',  # secondary text
    '#9A9AC4': '#93A4C4',  # dark-mode muted text
    '#EDEAE2': '#F3F6FA',
    '#E8F3EC': '#E7F7F5',
    '#C77700': '#1753A8',
    '#B3261E': '#B42318',
}

content = SOURCE.read_text(encoding='utf-8')
for old, new in PALETTE.items():
    content = content.replace(old, new).replace(old.lower(), new.lower())

content = content.replace('<title>Bundled Page</title>', '<title>Nexo Klar - Sistema de color Azul Nexo y Turquesa</title>')
DESTINATION.parent.mkdir(parents=True, exist_ok=True)
REPO_COPY.parent.mkdir(parents=True, exist_ok=True)
DESTINATION.write_text(content, encoding='utf-8')
REPO_COPY.write_text(content, encoding='utf-8')
print(DESTINATION)
print(REPO_COPY)
