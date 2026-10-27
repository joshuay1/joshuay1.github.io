#!/usr/bin/env python3
"""Import the complete Murmi preprint from its named-author LaTeX source.

Requires Python packages beautifulsoup4 and Pillow, Pandoc with citeproc, and
Poppler pdftoppm. The source directory must contain main.tex, references.bib,
and figures/. Run again whenever the preprint changes; the PDF is copied
separately so its published filename stays stable.

Usage: python bin/import_murmi_preprint.py /path/to/CHI_preprint
"""

from pathlib import Path
import argparse, tempfile, atexit
import re, subprocess, json, shutil, hashlib
from bs4 import BeautifulSoup
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
parser.add_argument("--pandoc", default="pandoc")
parser.add_argument("--pdftoppm", default="pdftoppm")
args = parser.parse_args()
source = args.source.resolve()
repo = Path(__file__).resolve().parents[1]
pandoc = args.pandoc
poppler = args.pdftoppm
temporary = tempfile.TemporaryDirectory(prefix="murmi-html-")
atexit.register(temporary.cleanup)
work = Path(temporary.name)
original = (source / "main.tex").read_text()
s = re.sub(r"(?<!\\)%[^\n]*", "", original)


def group(s, i):
    while s[i].isspace():
        i += 1
    assert s[i] == "{", (s[i : i + 80], i)
    start = i + 1
    depth = 1
    i += 1
    while depth:
        if s[i] == "\\":
            i += 2
            continue
        if s[i] == "{":
            depth += 1
        if s[i] == "}":
            depth -= 1
        i += 1
    return s[start : i - 1], i


def commands(s, name, n=1):
    pattern = re.compile(r"\\" + re.escape(name) + r"(?![A-Za-z])(?:\[[^\]]*\])?\s*")
    result = []
    for m in pattern.finditer(s):
        i = m.end()
        args = []
        for _ in range(n):
            arg, i = group(s, i)
            args.append(arg)
        result.append((m.start(), i, args))
    return result


def replace_commands(s, name, n, fn):
    for a, b, args in reversed(commands(s, name, n)):
        s = s[:a] + fn(*args) + s[b:]
    return s


def latex_html(s):
    s = s.replace("\\platformname{}", "Murmi").replace("\\platformname", "Murmi")
    out = subprocess.run(
        [pandoc, "-f", "latex", "-t", "html5", "--mathjax"],
        input=s,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.strip()
    return re.sub(r"^<p>|</p>$", "", out)


# Record the original figure/table numbers and descriptions before conversion.
figs = []
fig_num = 0
for m in re.finditer(r"\\begin\{(teaserfigure|figure\*?)\}(.*?)\\end\{\1\}", s, re.S):
    block = m.group(0)
    if "\\ContinuedFloat" not in block:
        fig_num += 1
    caps = commands(block, "caption")
    desc = commands(block, "Description")
    label = commands(block, "label")[0][2][0]
    imgs = []
    for im in re.finditer(r"\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}", block):
        imgs.append((im.group(2), im.group(1) or ""))
    figs.append(
        dict(
            label=label,
            number=fig_num,
            caption=caps[0][2][0],
            description=desc[0][2][0] if desc else "",
            images=imgs,
        )
    )
tables = []
for m in re.finditer(r"\\begin\{(table\*?|longtable)\}(.*?)\\end\{\1\}", s, re.S):
    block = m.group(0)
    tables.append(
        dict(
            label=commands(block, "label")[0][2][0],
            caption=commands(block, "caption")[0][2][0],
        )
    )
# Remove the print preamble; retain only content macros with web-safe definitions.
abstract = re.search(r"\\begin\{abstract\}(.*?)\\end\{abstract\}", s, re.S).group(1)
s = s.split("\\begin{document}", 1)[1].split("\\end{document}", 1)[0]
s = (
    s.replace("\\maketitle", "")
    .replace("\\begin{teaserfigure}", "\\begin{figure}")
    .replace("\\end{teaserfigure}", "\\end{figure}")
)
s = s.replace("\\begin{compactquotes}", "").replace("\\end{compactquotes}", "")
s = replace_commands(
    s,
    "quoteitem",
    2,
    lambda q, a: "\\begin{quote}\\textit{``" + q + "''} (" + a + ")\\end{quote}",
)
s = replace_commands(
    s, "shortstack", 1, lambda x: "{" + x.replace("\\\\", "\\newline ") + "}"
)
# Replace the print-only shaded-row macro with a semantic full-width table row.
a = s.index("\\newcommand{\\accounttopic}")
b = s.index("\\begin{longtable}", a)
s = s[:a] + s[b:]
s = replace_commands(
    s,
    "accounttopic",
    1,
    lambda t: "\\multicolumn{3}{l}{\\textbf{Topic: " + t + "}}\\\\\n",
)
# Print continuation headers/footers should appear only once in HTML.
s = re.sub(r"\\endfirsthead.*?\\endlastfoot", "", s, flags=re.S)
s = replace_commands(
    s, "multicolumn", 3, lambda n, align, text: text + " & " * (int(n) - 1)
)
s = s.replace("\\par\\smallskip", "\\newline ").replace("\\par ", "\\newline ")
s = s.replace("\\begin{acks}", "\\section*{Acknowledgements}").replace(
    "\\end{acks}", ""
)
s = s.replace("\\appendix", "\\hypertarget{paper-appendices}{}")
s = re.sub(r"\\bibliographystyle\{[^}]+\}", "", s)
s = re.sub(r"\\bibliography\{[^}]+\}", r"\\hypertarget{paper-references}{}", s)
s = (
    "\\newcommand{\\platformname}{Murmi}\n\\newcommand{\\revised}[1]{#1}\n\\section*{Abstract}\n"
    + abstract
    + "\n"
    + s
)
(work / "paper.tex").write_text(s)
subprocess.run(
    [
        pandoc,
        str(work / "paper.tex"),
        "-f",
        "latex",
        "-t",
        "html5",
        "--mathjax",
        "--citeproc",
        "--bibliography=" + str(source / "references.bib"),
        "--csl=" + str(repo / "bin/styles/association-for-computing-machinery.csl"),
        "-M",
        "link-citations=true",
        "-o",
        str(work / "paper.html"),
    ],
    check=True,
)
soup = BeautifulSoup(Path(str(work / "paper.html")).read_text(), "html.parser")
refs = {}
assets = repo / "assets/img/papers/murmi"
assets.mkdir(parents=True, exist_ok=True)
(repo / "_includes/papers").mkdir(parents=True, exist_ok=True)
# Preserve original pixels for screenshots; render the vector charts at reading resolution.
for meta, fig in zip(figs, soup.find_all("figure"), strict=True):
    fig["id"] = meta["label"]
    refs[meta["label"]] = str(meta["number"])
    fig["aria-label"] = BeautifulSoup(
        latex_html(meta["description"]), "html.parser"
    ).get_text(" ", strip=True)
    oldcap = fig.find("figcaption")
    if oldcap:
        oldcap.decompose()
    caption = soup.new_tag("figcaption")
    caption.append(
        BeautifulSoup(
            "Figure " + str(meta["number"]) + ". " + latex_html(meta["caption"]),
            "html.parser",
        )
    )
    fig.append(caption)
    panels = fig.find_all("div", class_="minipage", recursive=False)
    if panels:
        grid = soup.new_tag(
            "div", attrs={"class": "paper-panels paper-panels-" + str(len(panels))}
        )
        for panel in panels:
            grid.append(panel.extract())
        fig.insert(0, grid)
    for j, ((name, opts), image) in enumerate(
        zip(meta["images"], fig.find_all(["img", "embed"]), strict=True)
    ):
        original_asset = source / "figures" / name
        filename = Path(name).name
        if filename.endswith(".pdf"):
            filename = Path(name).stem + ".png"
            target = assets / filename
            subprocess.run(
                [
                    poppler,
                    "-singlefile",
                    "-scale-to",
                    "2000",
                    "-png",
                    str(original_asset),
                    str(target.with_suffix("")),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
            )
        elif "trim=" in opts:
            # Reproduce graphicx's source crop. JPEG natural dimensions use its density,
            # or 72 dpi when none is present, exactly as in pdfTeX's image inclusion.
            filename = Path(name).stem + "-paper-crop.jpg"
            target = assets / filename
            im = Image.open(original_asset)
            dpi = im.info.get("dpi", (72, 72))
            dpi = tuple(v if v else 72 for v in dpi)
            trim = re.search(r"trim=\{([^}]+)\}", opts).group(1)
            left, bottom, right, top = [
                float(v.replace("bp", "")) for v in trim.split()
            ]
            box = (
                round(left * dpi[0] / 72),
                round(top * dpi[1] / 72),
                im.width - round(right * dpi[0] / 72),
                im.height - round(bottom * dpi[1] / 72),
            )
            im.crop(box).save(target, quality=95)
        else:
            target = assets / filename
            shutil.copyfile(original_asset, target)
        image.name = "img"
        image.attrs = {
            "src": "/assets/img/papers/murmi/" + filename,
            "loading": "lazy",
            "decoding": "async",
        }
        with Image.open(target) as im:
            image["width"] = im.width
            image["height"] = im.height
        parent = image.find_parent(class_="minipage")
        image["alt"] = (
            parent.get_text(" ", strip=True)
            if parent
            else BeautifulSoup(latex_html(meta["description"]), "html.parser").get_text(
                " ", strip=True
            )
        )
        zoom = soup.new_tag("a", href=image["src"])
        zoom["class"] = "paper-image-link"
        zoom["aria-label"] = (
            "Open figure "
            + str(meta["number"])
            + (
                " panel "
                + chr(97 + j + (4 if meta["label"] == "fig:interface-continued" else 0))
                if len(meta["images"]) > 1
                else ""
            )
            + " at full resolution"
        )
        image.wrap(zoom)
# Remove print column widths; let cells wrap and allow horizontal scrolling on small screens.
for n, (meta, table) in enumerate(zip(tables, soup.find_all("table"), strict=True), 1):
    for duplicate in soup.find_all(id=meta["label"]):
        if duplicate is not table:
            duplicate.attrs.pop("id", None)
    table.attrs.pop("id", None)
    refs[meta["label"]] = str(n)
    table.attrs.pop("style", None)
    for colgroup in table.find_all("colgroup"):
        colgroup.decompose()
    caption = table.find("caption")
    if not caption:
        caption = soup.new_tag("caption")
        table.insert(0, caption)
    caption.clear()
    caption.append(
        BeautifulSoup(
            "Table " + str(n) + ". " + latex_html(meta["caption"]), "html.parser"
        )
    )
    for th in table.select("thead th"):
        th["scope"] = "col"
    for row in table.find_all("tr"):
        if not row.get_text(strip=True):
            row.decompose()
            continue
        cells = row.find_all(["td", "th"], recursive=False)
        if len(cells) > 1 and not any(c.get_text(strip=True) for c in cells[1:]):
            cells[0]["colspan"] = len(cells)
            for c in cells[1:]:
                c.decompose()
    wrapper = soup.new_tag(
        "div",
        attrs={
            "class": "paper-table-scroll",
            "role": "region",
            "aria-label": "Table " + str(n),
            "tabindex": "0",
        },
    )
    table.wrap(wrapper)
    block = soup.new_tag("div", attrs={"class": "paper-table", "id": meta["label"]})
    wrapper.wrap(block)
    caption.extract()
    caption.name = "p"
    caption["class"] = "paper-table-caption"
    caption["id"] = "caption-" + meta["label"]
    block.insert(0, caption)
    table["aria-labelledby"] = caption["id"]
# Number sections and appendices to match the paper, rather than treating appendices as section 8 onward.
appendix = False
section = 0
sub = 0
subsub = 0
for el in list(soup.find_all(["h1", "h2", "h3", "h4", "span", "div"])):
    if el.get("id") == "paper-appendices":
        appendix = True
        section = 0
        continue
    if el.name.startswith("h"):
        level = int(el.name[1])
        number = None
        if level == 1:
            sub = subsub = 0
            if "unnumbered" not in el.get("class", []):
                section += 1
                number = chr(64 + section) if appendix else str(section)
        elif level == 2:
            sub += 1
            subsub = 0
            number = (chr(64 + section) if appendix else str(section)) + "." + str(sub)
        elif level == 3:
            subsub += 1
            number = (
                (chr(64 + section) if appendix else str(section))
                + "."
                + str(sub)
                + "."
                + str(subsub)
            )
        if number:
            refs[el["id"]] = number
            el.insert(0, number + " ")
        el.name = "h" + str(min(level + 1, 6))
# Pandoc preserves second section labels as spans; resolve them to the preceding heading.
for el in soup.select("span[data-label]"):
    if el.get("id") in refs:
        continue
    prev = el.find_previous(re.compile("^h[2-5]$"))
    if prev and prev.get("id") in refs:
        refs[el["id"]] = refs[prev["id"]]
refs.update({"rq:experience": "1", "rq:record-work": "2"})
for n, eq in enumerate(
    [e for e in soup.select(".math.display") if "\\begin{equation}" in e.get_text()], 1
):
    text = eq.get_text()
    label = re.search(r"\\label\{([^}]+)\}", text).group(1)
    refs[label] = str(n)
    eq["id"] = label
    text = (
        re.sub(r"\\label\{[^}]+\}", "", text)
        .replace("\\begin{equation}", "")
        .replace("\\end{equation}", "")
    )
    eq.string = text.replace("\\]", r"\tag{" + str(n) + r"}\]")
for a in soup.select("a[data-reference]"):
    key = a["data-reference"]
    assert key in refs, key
    a.string = refs[key]
# Put references where the printed paper places them, before the appendices.
bibliography = soup.find(id="refs")
marker = soup.find(id="paper-references")
heading = soup.new_tag("h2", id="references")
heading.string = "References"
marker.replace_with(heading)
heading.insert_after(bibliography.extract())
# No print-layout attributes or empty label paragraphs need to remain.
for tag in soup.select("[data-latex-placement]"):
    del tag["data-latex-placement"]
for p in list(soup.find_all("p")):
    if not p.get_text(strip=True) and not p.find(["img", "span", "a"]):
        p.decompose()
content = (
    "<!-- Generated by bin/import_murmi_preprint.py from CHI_preprint/main.tex, SHA256 "
    + hashlib.sha256(original.encode()).hexdigest()
    + ". -->\n"
    + str(soup)
)
# Liquid must not interpret braces inside mathematical notation or source excerpts.
(repo / "_includes/papers/murmi.html").write_text(
    "{% raw %}\n" + content + "\n{% endraw %}\n"
)
(work / "manifest.json").write_text(
    json.dumps({"figures": figs, "tables": tables, "references": refs}, indent=2)
)
print(
    "Converted",
    len(figs),
    "figure blocks,",
    sum(len(f["images"]) for f in figs),
    "images,",
    len(tables),
    "tables,",
    len(soup.select(".csl-entry")),
    "references.",
)
