from pathlib import Path

source = Path('/Users/ricardo.hornig/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/1D21FF2C-6571-4CEE-A488-EBD2F17601A2/Nexo Klar - Pulso - Taller de cierre.html')
root = Path('/Users/ricardo.hornig/Desktop/Acceso Mina /Acceso Mina')
outputs = (
    Path('/Users/ricardo.hornig/Desktop/Nexo Klar/Nexo Klar - Pulso - Taller de cierre P9.html'),
    root / 'docs/Nexo Klar - Pulso - Taller de cierre P9.html',
    Path('/Users/ricardo.hornig/Documents/Acceso Mina /Acceso Mina/docs/Nexo Klar - Pulso - Taller de cierre P9.html'),
)

text = source.read_text(encoding='utf-8')

def replace_once(before: str, after: str) -> None:
    global text
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f'Reemplazo esperado una vez, encontrado {count}: {before[:60]}')
    text = text.replace(before, after, 1)

replace_once(
    '[\\"P8\\",\\"Diagonal\\",\\"Base inclinada\\"]\\n];',
    '[\\"P8\\",\\"Diagonal\\",\\"Base inclinada\\"],\\n  [\\"P9\\",\\"Pulso · referencia\\",\\"Logo recibido\\"]\\n];',
)
replace_once('variante: \\"P5\\", m1:', 'variante: \\"P9\\", m1:')
replace_once('Ocho variantes del concepto aprobado.', 'Nueve variantes del concepto aprobado, incluida P9 como referencia del logo recibido.')
replace_once('P5 Tejido como marca, P1 Pulso como reducción.', 'P5 Tejido como marca, P1 Pulso como reducción y P9 como referencia del logo recibido.')
replace_once('variante: s.variante, nombreVar,', 'variante: s.variante, marcaVariante: s.variante === \\"P9\\" ? \\"P1\\" : s.variante, nombreVar,')
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

for output in outputs:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text, encoding='utf-8')
    print(output)
