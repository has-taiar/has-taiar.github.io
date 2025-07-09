#!/usr/bin/env python3
import os
import markdown
from datetime import datetime

POSTS_DIR = '_posts'
OUTPUT_DIR = 'blog-posts'
TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body>
  <header class="container py-3">
    <h1>Has AlTaiar</h1>
    <nav>
      <a href="../index.html" class="btn btn-primary">Home</a>
      <a href="../about.html" class="btn btn-secondary">About</a>
      <a href="../contact.html" class="btn btn-secondary">Contact</a>
      <a href="../blog.html" class="btn btn-secondary">Blog</a>
    </nav>
  </header>
  <main class="container my-4">
    <h2>{title}</h2>
    <p><em>{date}</em></p>
    {content}
  </main>
  <footer class="container py-4 text-center">
    <hr>
    <p>&copy; 2025 Has AlTaiar</p>
  </footer>
</body>
</html>'''

def parse_front_matter(md_text):
    lines = md_text.splitlines()
    if lines and lines[0].strip() == '---':
        end = lines[1:].index('---') + 1
        front_matter = lines[1:end]
        body = '\n'.join(lines[end+1:])
        meta = {}
        for line in front_matter:
            if ':' in line:
                k, v = line.split(':', 1)
                meta[k.strip()] = v.strip().strip('"')
        return meta, body
    return {}, md_text

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for fname in os.listdir(POSTS_DIR):
        if fname.endswith('.md'):
            try:
                with open(os.path.join(POSTS_DIR, fname), encoding='utf-8') as f:
                    md_text = f.read()
            except UnicodeDecodeError as e:
                print(f'UnicodeDecodeError in file: {fname} - {e}')
                continue
            meta, body = parse_front_matter(md_text)
            title = meta.get('title', fname)
            date = meta.get('date', fname[:10])
            try:
                date_fmt = datetime.fromisoformat(date.replace('Z', '+00:00')).strftime('%B %d, %Y')
            except Exception:
                date_fmt = date
            html_content = markdown.markdown(body, extensions=['fenced_code', 'codehilite'])
            html = TEMPLATE.format(title=title, date=date_fmt, content=html_content)
            outname = fname.replace('.md', '.html')
            with open(os.path.join(OUTPUT_DIR, outname), 'w', encoding='utf-8') as outf:
                outf.write(html)
            print(f'Converted {fname} -> {outname}')

if __name__ == '__main__':
    main()
