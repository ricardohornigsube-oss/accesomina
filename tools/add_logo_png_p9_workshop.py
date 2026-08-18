from pathlib import Path
import base64

source = Path('/Users/ricardo.hornig/Downloads/Nexo Klar - Pulso - Taller de cierre.html')
logo = Path('/Users/ricardo.hornig/Downloads/Logo.png')
root = Path('/Users/ricardo.hornig/Desktop/Acceso Mina /Acceso Mina')
outputs = (
    Path('/Users/ricardo.hornig/Downloads/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado v2.html'),
    Path('/Users/ricardo.hornig/Desktop/Nexo Klar/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado v2.html'),
    root / 'docs/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado v2.html',
    Path('/Users/ricardo.hornig/Documents/Acceso Mina /Acceso Mina/docs/Nexo Klar - Pulso - Taller de cierre P9 - Logo integrado v2.html'),
)

text = source.read_text(encoding='utf-8')
logo_data = base64.b64encode(logo.read_bytes()).decode('ascii')

def replace_once(before: str, after: str) -> None:
    global text
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f'Reemplazo esperado una vez, encontrado {count}: {before[:70]}')
    text = text.replace(before, after, 1)

# P1 a P8 y todos sus componentes se conservan tal cual. Solo se agrega P9.
replace_once('Ocho variantes del concepto aprobado.', 'Nueve variantes del concepto aprobado.')
replace_once('Los ocho logos completos en la paleta elegida', 'Los nueve logos completos en la paleta elegida')
replace_once(
    '<sc-for list=\\"{{ galeria }}\\" as=\\"g\\" hint-placeholder-count=\\"8\\">',
    '<sc-for list=\\"{{ galeria }}\\" as=\\"g\\" hint-placeholder-count=\\"9\\">',
)
replace_once(
    '[\\"P8\\",\\"Diagonal\\",\\"Base inclinada\\"]\\n];',
    '[\\"P8\\",\\"Diagonal\\",\\"Base inclinada\\"],\\n  [\\"P9\\",\\"Logo integrado\\",\\"Referencia PNG final\\"]\\n];',
)
replace_once(
    'variante: s.variante, nombreVar,',
    'variante: s.variante, marcaVariante: s.variante === \\"P9\\" ? \\"P1\\" : s.variante, esP9: s.variante === \\"P9\\", heroDisplay: s.variante === \\"P9\\" ? \\"none\\" : \\"block\\", nombreVar,',
)
replace_once(
    'VARIANTES.map(([id, nombre]) => ({\\n        id, nombre,',
    'VARIANTES.map(([id, nombre]) => ({\\n        id, nombre, marcaVariante: id === \\"P9\\" ? \\"P1\\" : id,',
)
replace_once(
    'VARIANTES.map(([id, nombre, nota]) => ({\\n        id, nombre, nota,',
    'VARIANTES.map(([id, nombre, nota]) => ({\\n        id, nombre, nota, marcaVariante: id === \\"P9\\" ? \\"P1\\" : id, esP9: id === \\"P9\\", previewDisplay: id === \\"P9\\" ? \\"none\\" : \\"flex\\",',
)
text = text.replace('variante=\\"{{ variante }}\\"', 'variante=\\"{{ marcaVariante }}\\"')
text = text.replace('variante=\\"{{ v.id }}\\"', 'variante=\\"{{ v.marcaVariante }}\\"')
text = text.replace('variante=\\"{{ g.id }}\\"', 'variante=\\"{{ g.marcaVariante }}\\"')

# La tarjeta P9 también debe mostrar el PNG final, no una miniatura del isotipo anterior.
gallery_logo = f'''<sc-if value=\\"{{{{ g.esP9 }}}}\\"><img alt=\\"Nexo Klar · logo integrado\\" src=\\"data:image/png;base64,{logo_data}\\" style=\\"display:block;width:150px;height:46px;object-fit:contain;\\"></sc-if>\\n            '''
gallery_logo = gallery_logo.replace('\n', '\\n')
replace_once(
    '<span style=\\"display:flex;align-items:center;gap:12px;\\">\\n            <dc-import name=\\"Pulso\\" variante=\\"{{ g.marcaVariante }}\\"',
    gallery_logo + '<span style=\\"display:{{ g.previewDisplay }};align-items:center;gap:12px;\\">\\n            <dc-import name=\\"Pulso\\" variante=\\"{{ g.marcaVariante }}\\"',
)

# En P9 se reemplaza únicamente la vista principal por el PNG proporcionado.
replace_once(
    '<div style=\\"border-radius:6px;border:1px solid #DCD5C6;overflow:hidden;background:{{ fondo }};\\">',
    '<div style=\\"display:{{ heroDisplay }};border-radius:6px;border:1px solid #DCD5C6;overflow:hidden;background:{{ fondo }};\\">',
)
p9_hero = f'''\n  <sc-if value=\\"{{{{ esP9 }}}}\\" hint-placeholder-val=\\"{{{{ false }}}}\\">\n    <div style=\\"border-radius:6px;border:1px solid #DCD5C6;overflow:hidden;background:{{{{ fondo }}}};padding:clamp(32px,4vw,60px) clamp(20px,3vw,44px);min-height:270px;display:flex;align-items:center;justify-content:center;\\">\n      <img alt=\\"Nexo Klar · P9 logo integrado\\" src=\\"data:image/png;base64,{logo_data}\\" style=\\"display:block;width:min(100%,900px);height:auto;max-height:310px;object-fit:contain;\\">\n    </div>\n  <\\u002Fsc-if>\n'''
# El contenido vive dentro de un string JSON del taller original.
p9_hero = p9_hero.replace('\n', '\\n')
replace_once(
    '<main style=\\"display:flex;flex-direction:column;gap:20px;min-width:0;\\">\\n\\n  <div style=',
    '<main style=\\"display:flex;flex-direction:column;gap:20px;min-width:0;\\">' + p9_hero + '\\n  <div style=',
)

for output in outputs:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text, encoding='utf-8')
    print(output)
