#!/usr/bin/env python3
"""Import the full Belief Engine arXiv manuscript without rewriting its prose.

Usage: python bin/import_belief_engine.py /path/to/arxiv/source /path/to/paper.pdf
Requires pandoc, pdftoppm, tectonic, beautifulsoup4, Pillow and pypdf.
PANDOC may specify an alternate executable. Generated files use stable paths.
"""
from pathlib import Path
import argparse, hashlib, html, os, re, shutil, subprocess, tempfile
from bs4 import BeautifulSoup
from PIL import Image
from pypdf import PdfReader

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('pdf', type=Path)
args = parser.parse_args()
source = args.source.resolve()
repo = Path(__file__).resolve().parents[1]
pandoc = os.environ.get('PANDOC', 'pandoc')
original = (source / 'main.tex').read_text()
assets = repo / 'assets/img/papers/belief-engine'
assets.mkdir(parents=True, exist_ok=True)
refs = {}


def group(s, i):
    while i < len(s) and s[i].isspace(): i += 1
    assert s[i] == '{', s[i:i+80]
    start = i + 1
    depth = 1
    i += 1
    while depth:
        if s[i] == '\\': i += 2; continue
        if s[i] == '{': depth += 1
        if s[i] == '}': depth -= 1
        i += 1
    return s[start:i-1], i


def commands(s, name, n=1):
    result = []
    for m in re.finditer(r'\\' + name + r'(?![A-Za-z])(?:\[[^\]]*\])?\s*', s):
        i = m.end(); values = []
        for _ in range(n):
            val, i = group(s, i); values.append(val)
        result.append((m.start(), i, values))
    return result


def replace(s, name, n, fn):
    for a, b, vals in reversed(commands(s, name, n)):
        s = s[:a] + fn(*vals) + s[b:]
    return s


def convert(s):
    p = subprocess.run([pandoc, '-f', 'latex', '-t', 'html5', '--mathjax', '--wrap=none'], input=s, text=True, capture_output=True, check=True)
    assert not p.stderr.strip(), p.stderr
    return p.stdout


def inline(s):
    return re.sub(r'^<p>|</p>\s*$', '', convert(s).strip())


# Use the compiled bibliography's order and text, exactly as in the PDF.
bbl = (source / 'main.bbl').read_text()
items = list(re.finditer(r'\\bibitem\[(.*?)\]\{([^}]+)\}', bbl, re.S))
assert len(items) == 42
bib = []
authors = {}
for n, m in enumerate(items, 1):
    key = m.group(2)
    authors[key] = m.group(1).split('(')[0]
    refs['ref-' + key] = str(n)
    text = bbl[m.end():items[n].start() if n < len(items) else bbl.index(r'\end{thebibliography}')]
    text = text.replace(r'\newblock', ' ').replace(r'\penalty0', '')
    text = replace(text, 'natexlab', 1, lambda x: x)
    text = replace(text, 'doi', 1, lambda x: r'\href{https://doi.org/' + x + '}{doi: ' + x + '}')
    bib.append('<li id="ref-' + html.escape(key) + '">' + inline(text) + '</li>')


def cites(keys):
    keys = [k.strip() for k in keys.split(',')]
    keys.sort(key=lambda k: int(refs['ref-' + k]))
    return '[' + ', '.join(r'\hyperlink{ref-' + k + '}{' + refs['ref-' + k] + '}' for k in keys) + ']'


s = re.sub(r'(?<!\\)%[^\n]*', '', original)
s = s.split(r'\begin{abstract}', 1)[1].split(r'\end{document}', 1)[0]
s = r'\section*{Abstract}' + s.replace(r'\end{abstract}', '')
s = replace(s, 'citet', 1, lambda k: authors[k] + ' ' + cites(k))
s = replace(s, 'citep', 1, cites)
s = replace(s, 'cite', 1, cites)
assert not re.search(r'\\cite[a-z]+', s)
s = s.replace(r'\begin{ack}', r'\section*{Acknowledgments and Disclosure of Funding}').replace(r'\end{ack}', '')
s = s.replace(r'\input{main.bbl}', r'\hypertarget{paper-references}{}')
s = s.replace(r'\appendix', r'\hypertarget{paper-appendices}{}')
s = re.sub(r'\\(?:clearpage|newpage|FloatBarrier|raggedbottom|centering)(?![A-Za-z])', '', s)
s = re.sub(r'\\(?:hyphenpenalty|emergencystretch)=[^\s]+', '', s)
s = replace(s, 'setcounter', 2, lambda *x: '')
s = replace(s, 'renewcommand', 2, lambda *x: '')
s = replace(s, 'setlength', 2, lambda *x: '')
s = replace(s, 'resizebox', 3, lambda w,h,x: x)
s = replace(s, 'shortstack', 1, lambda x: '{' + x.replace('\\\\', r'\newline ') + '}')
# Store figure blocks as placeholders; convert their original captions separately.
figures = []
main_number = appendix_number = 0
for m in re.finditer(r'\\begin\{figure\}(.*?)\\end\{figure\}', s, re.S):
    b = m.group(1)
    appendix = m.start() > s.index('paper-appendices')
    if appendix: appendix_number += 1; number = 'A' + str(appendix_number)
    else: main_number += 1; number = str(main_number)
    label = commands(b, 'label')[0][2][0]
    refs[label] = number
    figures.append((m.start(),m.end(),label,number,b))
assert (main_number,appendix_number) == (4,7)
for a,b,label,n,block in reversed(figures):
    s = s[:a] + r'\hypertarget{placeholder-' + label + '}{}' + s[b:]
# Tables retain their actual rows and captions; only print column constraints change.
main_number = appendix_number = 0
tables = []
for m in re.finditer(r'\\begin\{table\}(.*?)\\end\{table\}', s, re.S):
    b = m.group(1)
    appendix = m.start() > s.index('paper-appendices')
    if appendix: appendix_number += 1; number = 'A' + str(appendix_number)
    else: main_number += 1; number = str(main_number)
    label = commands(b, 'label')[0][2][0]
    refs[label] = number
    tables.append((label, number, commands(b, 'caption')[0][2][0]))
for m in reversed(list(re.finditer(r'\\begin\{tabular\}', s))):
    spec,end = group(s,m.end())
    for token in ['@','>','<','!']:
        while token+'{' in spec:
            a=spec.index(token+'{'); _,b=group(spec,a+1); spec=spec[:a]+spec[b:]
    spec = re.sub(r'[pmb]\{[^}]*\}', 'l', spec)
    s=s[:m.end()]+'{'+spec+'}'+s[end:]
# Section references and headings use the manuscript's main/appendix numbering.
section = sub = subsub = 0
appendix = False
headings = []
for m in re.finditer(r'\\(section|subsection|subsubsection)(\*)?\s*\{', s):
    title,end=group(s,m.end()-1)
    if not appendix and m.start() > s.index('paper-appendices'):
        appendix=True; section=sub=subsub=0
    level={'section':1,'subsection':2,'subsubsection':3}[m.group(1)]
    number=''
    if not m.group(2):
        if level==1: section+=1;sub=subsub=0
        elif level==2: sub+=1;subsub=0
        else: subsub+=1
        number=(chr(64+section) if appendix else str(section))
        if level>=2: number+='.'+str(sub)
        if level>=3: number+='.'+str(subsub)
    label=re.match(r'\s*\\label\{([^}]+)\}', s[end:])
    if label: refs[label.group(1)]=number
    headings.append((level,number,title))

with tempfile.TemporaryDirectory(prefix='belief-engine-html-') as temp:
    work=Path(temp)
    figure_html={}
    for _,_,label,number,b in figures:
        caption=commands(b,'caption')[0][2][0]
        names=[v[2][0] for v in commands(b,'includegraphics')]
        if 'stance_alignment_ten_topics.tex' in b:
            # Render the original TikZ vector figure, rather than reconstructing its data.
            tex=r'''\documentclass{standalone}
\usepackage{tikz}
\usepackage{amsmath}
\usepackage{xcolor}
\begin{document}
'''+(source/'figures/stance_alignment_ten_topics.tex').read_text()+r'\end{document}'
            (work/'stance-alignment.tex').write_text(tex)
            subprocess.run(['tectonic','-o',str(work),str(work/'stance-alignment.tex')],check=True,stdout=subprocess.DEVNULL)
            names=[str(work/'stance-alignment.pdf')]
        imgs=[]
        for name in names:
            asset=source/name
            target=assets/(Path(name).stem+'.png')
            subprocess.run(['pdftoppm','-singlefile','-scale-to','2400','-png',str(asset),str(target.with_suffix(''))],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
            w,h=Image.open(target).size
            url='/assets/img/papers/belief-engine/'+target.name
            alt='Figure '+number+(' panel '+str(len(imgs)+1) if len(names)>1 else '')
            imgs.append(f'<a class="paper-image-link" href="{url}" aria-label="Open {alt.lower()} at full resolution"><img src="{url}" alt="{alt}; description in the caption below" width="{w}" height="{h}" style="aspect-ratio: {w} / {h};" loading="lazy" decoding="async"></a>')
        columns = len(imgs) if r'\begin{minipage}' in b else 1
        figure_html[label]=f'<figure id="{label}"><div class="paper-panels paper-panels-{columns}">'+''.join(imgs)+'</div><figcaption>Figure '+number+'. '+inline(caption)+'</figcaption></figure>'
    out=convert(s)
    soup=BeautifulSoup(out,'html.parser')
    for label, markup in figure_html.items():
        marker=soup.find(id='placeholder-'+label)
        assert marker, label
        marker.replace_with(BeautifulSoup(markup,'html.parser'))
    rendered_headings=soup.find_all(re.compile('^h[1-3]$'))
    assert len(rendered_headings)==len(headings),(len(rendered_headings),len(headings))
    for el,(level,number,title) in zip(rendered_headings,headings):
        if number:
            refs[el['id']]=number
            el.insert(0,number+' ')
        el.name='h'+str(level+1)
    # Captioned tables are numbered independently from the unnumbered grid summary.
    captioned=[t for t in soup.find_all('table') if t.find('caption')]
    assert len(captioned)==len(tables),(len(captioned),len(tables))
    for t,(label,number,caption) in zip(captioned,tables):
        for dup in soup.find_all(id=label): dup.attrs.pop('id',None)
        t['id']=label
        cap=t.find('caption');cap.clear();cap.append(BeautifulSoup('Table '+number+'. '+inline(caption),'html.parser'))
    for t in soup.find_all('table'):
        for col in t.find_all('colgroup'): col.decompose()
        for th in t.select('thead th'): th['scope']='col'
        wrapper=soup.new_tag('div',attrs={'class':'paper-table-scroll','tabindex':'0','role':'region','aria-label':t.find('caption').get_text(' ',strip=True)[:100] if t.find('caption') else 'Calibration parameter grid'})
        t.wrap(wrapper)
    for el in soup.select('span[data-label]'):
        if el.get('id') not in refs:
            prev=el.find_previous(re.compile('^h[2-5]$'))
            if prev and prev.get('id') in refs: refs[el['id']]=refs[prev['id']]
    eqnum=0
    for el in soup.select('.math.display'):
        text=el.get_text()
        if r'\begin{equation}' in text:
            eqnum+=1
            label=re.search(r'\\label\{([^}]+)\}',text)
            if label: el['id']=label.group(1);refs[label.group(1)]=str(eqnum)
            text=re.sub(r'\\label\{[^}]+\}','',text).replace(r'\begin{equation}','').replace(r'\end{equation}','')
            if label and label.group(1) == 'eq:belief-update':
                text = text.replace('L_t =', r'\begin{aligned} L_t &=').replace(r'\qquad', r'\\').replace('S_t =', 'S_t &=', 1).replace(r'\quad S_t', r'\\ &\quad S_t')
                text = text.replace(r'\]', r'\end{aligned}\]')
            el.string=text.replace(r'\]',r'\tag{'+str(eqnum)+r'}\]')
    for a in soup.select('a[data-reference]'):
        key=a['data-reference'];assert key in refs,key
        a.string=refs[key]
    marker=soup.find(id='paper-references')
    marker.replace_with(BeautifulSoup('<h2 id="references">References</h2><ol class="paper-references">'+''.join(bib)+'</ol>','html.parser'))
    for p in list(soup.find_all('p')):
        if not p.get_text(strip=True) and not p.find(['img','span','a']): p.decompose()
    # A contents list gives direct access to every main section and appendix.
    toc='<nav class="paper-contents" aria-label="Paper contents"><details><summary>Contents</summary><ol>'
    for h in soup.find_all('h2'):
        toc+='<li><a href="#'+h['id']+'">'+html.escape(h.get_text(' ',strip=True))+'</a></li>'
    toc+='</ol></details></nav>'
    content=toc+str(soup)
    # Fail on missing cross-reference targets or missing image assets.
    ids=[t['id'] for t in soup.select('[id]')]
    assert len(ids)==len(set(ids)), 'Duplicate anchor IDs'
    for a in soup.select('a[href^="#"]'): assert a['href'][1:] in ids,a
    assert len(soup.find_all('figure'))==11
    assert len(soup.find_all('table'))==len(tables)+1
    assert len(soup.select('.paper-references > li'))==42
    (repo/'_includes/papers/belief-engine.html').write_text('{% raw %}\n'+content+'\n{% endraw %}\n')
    pdfout=repo/'pubs/belief-engine/belief-engine.pdf';pdfout.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(args.pdf,pdfout)
    manifest={'source_sha256':hashlib.sha256(original.encode()).hexdigest(),'pdf_sha256':hashlib.sha256(args.pdf.read_bytes()).hexdigest(),'pdf_pages':len(PdfReader(args.pdf).pages),'figures':11,'numbered_tables':len(tables),'tables':len(soup.find_all('table')),'references':42,'headings':[h.get_text(' ',strip=True) for h in soup.find_all(re.compile('^h[2-4]$'))]}
    import json
    (repo/'bin/belief-engine-import.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(manifest,indent=2))
