from pathlib import Path
import base64

source = Path('/Users/ricardo.hornig/Downloads/Nexo Klar - Pulso - Taller de cierre.html')
logo = Path('/Users/ricardo.hornig/Downloads/Logo.png')
root = Path('/Users/ricardo.hornig/Desktop/Acceso Mina /Acceso Mina')
outputs = (
    Path('/Users/ricardo.hornig/Downloads/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado.html'),
    Path('/Users/ricardo.hornig/Desktop/Nexo Klar/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado.html'),
    root / 'docs/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado.html',
    Path('/Users/ricardo.hornig/Documents/Acceso Mina /Acceso Mina/docs/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado.html'),
)

text = source.read_text(encoding='utf-8')
logo_data = base64.b64encode(logo.read_bytes()).decode('ascii')

def replace_once(before: str, after: str) -> None:
    global text
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f'Reemplazo esperado una vez, encontrado {count}: {before[:70]}')
    text = text.replace(before, after, 1)

# Se conserva la selección inicial, las paletas y toda la lógica del taller. P9 usa P1 como geometría
# editable para que los controles existentes continúen funcionando, y agrega el PNG real como referencia.
replace_once(
    '[\\"P8\\",\\"Diagonal\\",\\"Base inclinada\\"]\\n];',
    '[\\"P8\\",\\"Diagonal\\",\\"Base inclinada\\"],\\n  [\\"P9\\",\\"Logo integrado\\",\\"Referencia PNG final\\"]\\n];',
)
replace_once(
    'variante: s.variante, nombreVar,',
    'variante: s.variante, marcaVariante: s.variante === \\"P9\\" ? \\"P1\\" : s.variante, esP9: s.variante === \\"P9\\", nombreVar,',
)
replace_once(
    'VARIANTES.map(([id, nombre]) => ({\\n        id, nombre,',
    'VARIANTES.map(([id, nombre]) => ({\\n        id, nombre, marcaVariante: id === \\"P9\\" ? \\"P1\\" : id,',
)
replace_once(
    'VARIANTES.map(([id, nombre, nota]) => ({\\n        id, nombre, nota,',
    'VARIANTES.map(([id, nombre, nota]) => ({\\n        id, nombre, nota, marcaVariante: id === \\"P9\\" ? \\"P1\\" : id,',
)
text = text.replace('variante=\\"{{ variante }}\\"', 'variante=\\"{{ marcaVariante }}\\"')
text = text.replace('variante=\\"{{ v.id }}\\"', 'variante=\\"{{ v.marcaVariante }}\\"')
text = text.replace('variante=\\"{{ g.id }}\\"', 'variante=\\"{{ g.marcaVariante }}\\"')

p9_panel = f'''\n  <sc-if value=\\"{{{{ esP9 }}}}\\" hint-placeholder-val=\\"{{{{ false }}}}\\">\n    <div style=\\"background:#FFFFFF;border:1px solid #DCD5C6;border-left:5px solid #00CFC1;border-radius:6px;padding:20px 24px;display:flex;flex-direction:column;gap:12px;\\">\n      <div style=\\"font:600 10px/1 Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#2A2A8C;\\">P9 · Logo integrado</div>\n      <img alt=\\"Nexo Klar P9 logo integrado\\" src=\\"data:image/png;base64,{logo_data}\\" style=\\"display:block;width:min(100%,760px);height:auto;align-self:center;\\">\n      <div style=\\"font-size:12px;line-height:1.55;color:#5D6B7A;\\">Logo PNG incorporado como referencia visual. Los controles de color y las aplicaciones del Taller permanecen activos para evaluar esta alternativa.</div>\n    </div>\n  <\\u002Fsc-if>\n'''
replace_once(
    '<main style=\\"display:flex;flex-direction:column;gap:20px;min-width:0;\\">\\n\\n  <div style=',
    '<main style=\\"display:flex;flex-direction:column;gap:20px;min-width:0;\\">' + p9_panel + '\\n  <div style=',
)

for output in outputs:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text, encoding='utf-8')
    print(output)
