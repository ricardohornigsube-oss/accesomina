from pathlib import Path

desktop = Path('/Users/ricardo.hornig/Desktop/Nexo Klar/Logo Pulso - Recursos')
repo = Path('/Users/ricardo.hornig/Desktop/Acceso Mina /Acceso Mina/docs/Logo Pulso - Recursos')
backup = Path('/Users/ricardo.hornig/Documents/Acceso Mina /Acceso Mina/docs/Logo Pulso - Recursos')

bars = '''<g transform="translate(0 0)">
  <rect x="2" y="72" width="34" height="11" rx="5.5" fill="#1A1A5E"/><rect x="2" y="54" width="34" height="11" rx="5.5" fill="#1A1A5E"/>
  <rect x="39" y="72" width="38" height="11" rx="5.5" fill="#00CFC1"/><rect x="39" y="54" width="38" height="11" rx="5.5" fill="#00CFC1"/><rect x="39" y="36" width="38" height="11" rx="5.5" fill="#00CFC1"/>
  <rect x="80" y="72" width="34" height="11" rx="5.5" fill="#E9A319"/><rect x="80" y="54" width="34" height="11" rx="5.5" fill="#E9A319"/><rect x="80" y="36" width="34" height="11" rx="5.5" fill="#1A1A5E"/><rect x="80" y="18" width="34" height="11" rx="5.5" fill="#1A1A5E"/>
  <rect x="39" y="18" width="38" height="11" rx="5.5" fill="#1E3AE0"/><rect x="39" y="0" width="38" height="11" rx="5.5" fill="#1E3AE0"/>
</g>'''

svg = {
    'Nexo Klar - Isotipo editable.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 84">{bars}</svg>''',
    'Nexo Klar - Logo horizontal editable.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 140"><g transform="translate(22 27)">{bars}</g><text x="165" y="76" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="700" letter-spacing="-3" fill="#071A45">Nexo Klar</text><text x="168" y="108" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="500" letter-spacing="1.4" fill="#667085">GESTIÓN INTELIGENTE DE RECURSOS</text></svg>''',
    'Nexo Klar - Logo vertical editable.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 350"><g transform="translate(72 24)">{bars}</g><text x="130" y="187" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" letter-spacing="-3" fill="#071A45">Nexo</text><text x="130" y="239" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" letter-spacing="-3" fill="#071A45">Klar</text><text x="130" y="281" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="500" letter-spacing="1.1" fill="#667085">GESTIÓN INTELIGENTE</text><text x="130" y="300" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="500" letter-spacing="1.1" fill="#667085">DE RECURSOS</text></svg>''',
}

for folder in (desktop, repo, backup):
    folder.mkdir(parents=True, exist_ok=True)
    for name, content in svg.items():
        (folder / name).write_text(content, encoding='utf-8')
    (folder / 'LEEME.txt').write_text(
        'PNG: recortes de la lámina recibida. SVG: reconstrucción editable con fondo transparente.\n'
        'Para uso legal definitivo, solicite al diseñador los archivos fuente originales (AI/SVG).\n',
        encoding='utf-8',
    )
    print(folder)
