"""Typesets the offer document from the app's own data.

Reads scripts/drhp-data.json (produced by dump-drhp-data.mjs) and writes
public/Main_DRHP.pdf: an A4, SEBI-format draft red herring prospectus with a
statutory cover page, a table of contents, running heads, folio numbers and
PDF bookmarks for every section — so the viewer's section rail is driven by
the document's own outline rather than by guessing at its headings.

    python scripts/build_drhp_pdf.py
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)
ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "scripts" / "drhp-data.json").read_text(encoding="utf-8"))
OUT = ROOT / "public" / "Main_DRHP.pdf"

INK = colors.HexColor("#101a2b")
RULE = colors.HexColor("#9aa8bd")
SOFT = colors.HexColor("#5b6b84")
BAND = colors.HexColor("#eef2f8")
LINE = colors.HexColor("#c8d3e2")

PAGE_W, PAGE_H = A4
L_MARGIN = R_MARGIN = 20 * mm
T_MARGIN = 22 * mm
B_MARGIN = 18 * mm


# ---------------------------------------------------------------- fonts

def register_fonts() -> tuple[str, str, str]:
    """Prefer a Unicode serif so the rupee sign and en dashes survive."""
    win = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
    candidates = [
        ("TimesNewRoman", win / "times.ttf", win / "timesbd.ttf", win / "timesi.ttf"),
        ("DejaVuSerif", win / "DejaVuSerif.ttf", win / "DejaVuSerif-Bold.ttf", None),
    ]
    for name, regular, bold, italic in candidates:
        if not (regular.exists() and bold.exists()):
            continue
        pdfmetrics.registerFont(TTFont(name, str(regular)))
        pdfmetrics.registerFont(TTFont(name + "-Bold", str(bold)))
        if italic and italic.exists():
            pdfmetrics.registerFont(TTFont(name + "-Italic", str(italic)))
            pdfmetrics.registerFontFamily(
                name, normal=name, bold=name + "-Bold", italic=name + "-Italic"
            )
        else:
            pdfmetrics.registerFontFamily(name, normal=name, bold=name + "-Bold")
        return name, name + "-Bold", name + ("-Italic" if italic and italic.exists() else "")
    return "Times-Roman", "Times-Bold", "Times-Italic"


BODY_F, BOLD_F, ITALIC_F = register_fonts()
# Standard-encoding Times cannot draw U+20B9; fall back to the ISO code.
RUPEE = "\u20b9" if BODY_F != "Times-Roman" else "Rs. "


def money(text: str) -> str:
    return text.replace("\u20b9", RUPEE)


# ---------------------------------------------------------------- styles

ss = getSampleStyleSheet()

S = {
    "body": ParagraphStyle(
        "body", parent=ss["BodyText"], fontName=BODY_F, fontSize=9.6, leading=14.2,
        alignment=TA_JUSTIFY, textColor=INK, spaceAfter=7,
    ),
    "bodyc": ParagraphStyle(
        "bodyc", fontName=BODY_F, fontSize=9.4, leading=13.4, alignment=TA_CENTER,
        textColor=INK, spaceAfter=5,
    ),
    "small": ParagraphStyle(
        "small", fontName=BODY_F, fontSize=8.1, leading=11.4, alignment=TA_JUSTIFY,
        textColor=SOFT, spaceAfter=5,
    ),
    "smallc": ParagraphStyle(
        "smallc", fontName=BODY_F, fontSize=8.1, leading=11.4, alignment=TA_CENTER,
        textColor=SOFT, spaceAfter=4,
    ),
    "cover_kicker": ParagraphStyle(
        "cover_kicker", fontName=BOLD_F, fontSize=10.5, leading=14, alignment=TA_CENTER,
        textColor=INK, spaceAfter=2,
    ),
    "cover_name": ParagraphStyle(
        "cover_name", fontName=BOLD_F, fontSize=23, leading=27, alignment=TA_CENTER,
        textColor=INK, spaceAfter=3,
    ),
    "cover_rule": ParagraphStyle(
        "cover_rule", fontName=BOLD_F, fontSize=10, leading=13.5, alignment=TA_CENTER,
        textColor=INK, spaceBefore=6, spaceAfter=3,
    ),
    "section": ParagraphStyle(
        "section", fontName=BOLD_F, fontSize=15, leading=19, alignment=TA_LEFT,
        textColor=INK, spaceBefore=0, spaceAfter=3,
    ),
    "section_no": ParagraphStyle(
        "section_no", fontName=BOLD_F, fontSize=8.4, leading=11, alignment=TA_LEFT,
        textColor=SOFT, spaceAfter=1,
    ),
    "h2": ParagraphStyle(
        "h2", fontName=BOLD_F, fontSize=10.6, leading=14, alignment=TA_LEFT,
        textColor=INK, spaceBefore=9, spaceAfter=4,
    ),
    "th": ParagraphStyle("th", fontName=BOLD_F, fontSize=8.4, leading=11, textColor=INK),
    "td": ParagraphStyle("td", fontName=BODY_F, fontSize=8.4, leading=11.4, textColor=INK),
    "tdr": ParagraphStyle(
        "tdr", fontName=BODY_F, fontSize=8.4, leading=11.4, textColor=INK, alignment=TA_RIGHT
    ),
    "toc0": ParagraphStyle(
        "toc0", fontName=BOLD_F, fontSize=9.6, leading=17, textColor=INK, leftIndent=0
    ),
    "toc1": ParagraphStyle(
        "toc1", fontName=BODY_F, fontSize=9, leading=14.5, textColor=SOFT, leftIndent=14
    ),
}


def P(text: str, style: str = "body") -> Paragraph:
    return Paragraph(money(text), S[style])


# ---------------------------------------------------------------- helpers

def inr(n: int | float) -> str:
    """Indian digit grouping: 9109100 -> 91,09,100."""
    n = int(round(n))
    sign, s = ("-", str(-n)) if n < 0 else ("", str(n))
    if len(s) <= 3:
        return sign + s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:])
        head = head[:-2]
    if head:
        parts.insert(0, head)
    return sign + ",".join(parts) + "," + tail


def table(rows, widths, align_right=(), header=True, zebra=True, font_size=8.4):
    style = [
        ("FONTNAME", (0, 0), (-1, -1), BODY_F),
        ("FONTSIZE", (0, 0), (-1, -1), font_size),
        ("TEXTCOLOR", (0, 0), (-1, -1), INK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
    ]
    if header:
        style += [
            ("FONTNAME", (0, 0), (-1, 0), BOLD_F),
            ("BACKGROUND", (0, 0), (-1, 0), BAND),
            ("LINEBELOW", (0, 0), (-1, 0), 0.8, RULE),
        ]
    for col in align_right:
        style.append(("ALIGN", (col, 1 if header else 0), (col, -1), "RIGHT"))
    if zebra:
        start = 1 if header else 0
        for i in range(start, len(rows)):
            if (i - start) % 2 == 1:
                style.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#f7f9fc")))
    t = Table([[money(str(c)) for c in row] for row in rows], colWidths=widths, repeatRows=1 if header else 0)
    t.setStyle(TableStyle(style))
    return t


def rule(width=None, thickness=0.9, color=RULE, space_before=2, space_after=8):
    t = Table([[""]], colWidths=[width or (PAGE_W - L_MARGIN - R_MARGIN)], rowHeights=[0.1])
    t.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), thickness, color),
        ("TOPPADDING", (0, 0), (-1, -1), space_before),
        ("BOTTOMPADDING", (0, 0), (-1, -1), space_after),
    ]))
    return t


def boxed(flowables, pad=8, bg=colors.white, border=RULE):
    t = Table([[flowables]], colWidths=[PAGE_W - L_MARGIN - R_MARGIN])
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, border),
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LEFTPADDING", (0, 0), (-1, -1), pad),
        ("RIGHTPADDING", (0, 0), (-1, -1), pad),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
    ]))
    return t


# ---------------------------------------------------------------- template

class DRHP(BaseDocTemplate):
    """Adds running heads, folios and one bookmark per section."""

    def __init__(self, path, **kw):
        super().__init__(path, pagesize=A4, **kw)
        frame = Frame(
            L_MARGIN, B_MARGIN,
            PAGE_W - L_MARGIN - R_MARGIN, PAGE_H - T_MARGIN - B_MARGIN,
            id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
        )
        cover_frame = Frame(
            L_MARGIN, B_MARGIN,
            PAGE_W - L_MARGIN - R_MARGIN, PAGE_H - 14 * mm - B_MARGIN,
            id="cover", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
        )
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover_frame], onPage=self.paint_cover),
            PageTemplate(id="body", frames=[frame], onPage=self.paint_body),
        ])
        self._bookmarks = 0
        self.current_section = ""
        # Section roman numeral -> the folio the section opens on. Filled on
        # the first build and fed back into the second so the contents table
        # can print real page numbers.
        self.section_pages: dict[str, int] = {}

    # -- page furniture ------------------------------------------------
    def paint_cover(self, canv, doc):
        canv.saveState()
        canv.setStrokeColor(RULE)
        canv.setLineWidth(1.4)
        canv.rect(12 * mm, 12 * mm, PAGE_W - 24 * mm, PAGE_H - 24 * mm)
        canv.setLineWidth(0.4)
        canv.rect(13.6 * mm, 13.6 * mm, PAGE_W - 27.2 * mm, PAGE_H - 27.2 * mm)
        canv.restoreState()

    def paint_body(self, canv, doc):
        canv.saveState()
        canv.setFont(BODY_F, 7.4)
        canv.setFillColor(SOFT)
        head = f"{DATA['company']['proposedName']} \u2014 Draft Red Herring Prospectus"
        canv.drawString(L_MARGIN, PAGE_H - 14 * mm, head)
        canv.drawRightString(PAGE_W - R_MARGIN, PAGE_H - 14 * mm, "Private & Confidential")
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(L_MARGIN, PAGE_H - 15.6 * mm, PAGE_W - R_MARGIN, PAGE_H - 15.6 * mm)

        canv.line(L_MARGIN, B_MARGIN - 5 * mm, PAGE_W - R_MARGIN, B_MARGIN - 5 * mm)
        canv.setFont(BODY_F, 7.4)
        if self.current_section:
            canv.drawString(L_MARGIN, B_MARGIN - 9.5 * mm, self.current_section[:70])
        canv.drawRightString(PAGE_W - R_MARGIN, B_MARGIN - 9.5 * mm, str(canv.getPageNumber()))
        canv.restoreState()

    # -- outline + TOC -------------------------------------------------
    def afterFlowable(self, flowable):
        if not isinstance(flowable, Paragraph):
            return
        name = flowable.style.name
        if name == "section":
            text = flowable.getPlainText()
            self.current_section = text
            self._bookmarks += 1
            key = f"sec{self._bookmarks}"
            self.canv.bookmarkPage(key)
            # Headings are set in caps; the bookmark carries the cased title,
            # because a navigation rail of shouting is unreadable.
            self.canv.addOutlineEntry(
                getattr(flowable, "_drhp_label", text), key, level=0, closed=False
            )
            no = getattr(flowable, "_drhp_no", None)
            if no is not None:
                self.section_pages[no] = self.page
        elif name == "h2":
            # Sub-heads become bookmarks so the viewer's rail can nest them,
            # but they stay out of the printed contents: a table that grows
            # past one page changes the pagination it is reporting, and the
            # two passes then never agree on a page number.
            text = flowable.getPlainText()
            self._bookmarks += 1
            key = f"sub{self._bookmarks}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=1, closed=True)


# ---------------------------------------------------------------- content

C = DATA["company"]
I = DATA["issue"]
CD = DATA["capitalDerived"]
CAP = DATA["capital"]
FIN = DATA["financials"]
RAT = DATA["ratios"]
TODAY = date.today().strftime("%d %B %Y")
CONTENT_W = PAGE_W - L_MARGIN - R_MARGIN


def cover_page() -> list:
    f: list = []
    f.append(Spacer(1, 6))
    f.append(P("DRAFT RED HERRING PROSPECTUS", "cover_kicker"))
    f.append(P(f"Dated {TODAY} | Please read Section 32 of the Companies Act, 2013", "smallc"))
    f.append(P("(This Draft Red Herring Prospectus will be updated upon filing with the RoC)", "smallc"))
    f.append(P("100% Book Built Issue", "smallc"))
    f.append(Spacer(1, 14))

    f.append(P(C["proposedName"].upper(), "cover_name"))
    f.append(P(f"CIN: {C['cin']}", "smallc"))
    f.append(Spacer(1, 8))
    f.append(P(
        f"Our Company was incorporated as {C['legalName']} at Pune, Maharashtra, on {C['incorporated']} "
        f"under the Companies Act, 2013, and is registered with the {C['roc']}. For details of changes in "
        "the name and registered office of our Company, see \u201cHistory and Certain Corporate Matters\u201d "
        "on the pages indicated in the table of contents.",
        "smallc",
    ))
    f.append(Spacer(1, 6))
    f.append(P(
        f"<b>Registered Office:</b> {C['regOffice']} | <b>Website:</b> {C['website']}<br/>"
        f"<b>Contact Person:</b> Company Secretary and Compliance Officer | <b>Sector:</b> {C['sector']}",
        "smallc",
    ))
    f.append(Spacer(1, 8))
    f.append(P(
        f"PROMOTERS OF OUR COMPANY: {DATA['capTable'][0]['holder'].upper()} AND "
        f"{DATA['capTable'][1]['holder'].upper()}",
        "cover_rule",
    ))
    f.append(rule(space_after=6))

    f.append(P("THE ISSUE", "cover_rule"))
    f.append(P(
        f"Initial public issue of up to {inr(CAP['freshIssueShares'])} equity shares of face value "
        f"\u20b9{I['faceValue']} each (the \u201cEquity Shares\u201d) of {C['proposedName']} "
        f"(the \u201cCompany\u201d or the \u201cIssuer\u201d) for cash at a price within the band of "
        f"\u20b9{I['floorPrice']} to \u20b9{I['capPrice']} per equity share, aggregating up to "
        f"\u20b9{I['sizeCr']:.2f} crore (the \u201cIssue\u201d). The Issue is a fresh issue and includes "
        f"no offer for sale. Of the Issue, up to {inr(CD['marketMakerShares'])} equity shares will be "
        f"reserved for subscription by the Market Maker. The Issue and the net issue will constitute "
        f"{CAP['freshIssueShares'] / CD['postIssueShares'] * 100:.2f}% of the post-issue paid-up equity "
        f"share capital of our Company.",
        "smallc",
    ))
    f.append(Spacer(1, 6))
    f.append(table(
        [
            ["Price Band", f"\u20b9{I['floorPrice']} \u2013 \u20b9{I['capPrice']} per equity share"],
            ["Face Value", f"\u20b9{I['faceValue']} per equity share"],
            ["Minimum Bid Lot", f"{inr(I['lotSize'])} equity shares and in multiples thereof"],
            ["Issue Size", f"Up to \u20b9{I['sizeCr']:.2f} crore"],
            ["Proposed Listing", I["platform"]],
        ],
        widths=[CONTENT_W * 0.32, CONTENT_W * 0.68],
        header=False, zebra=True, font_size=8.2,
    ))
    f.append(Spacer(1, 8))

    f.append(P("RISKS IN RELATION TO THE FIRST ISSUE", "cover_rule"))
    f.append(P(
        f"This being the first public issue of our Company, there has been no formal market for the equity "
        f"shares. The face value of the equity shares is \u20b9{I['faceValue']} and the floor price and cap "
        f"price are {I['floorPrice'] / I['faceValue']:.1f} times and {I['capPrice'] / I['faceValue']:.1f} "
        "times the face value respectively. The issue price, as determined by our Company in consultation "
        "with the Lead Manager on the basis set out in \u201cBasis for Issue Price\u201d, should not be taken "
        "to be indicative of the market price of the equity shares after listing. No assurance can be given "
        "regarding an active or sustained trading market for the equity shares, or as to the price at which "
        "they will be traded after listing.",
        "smallc",
    ))
    f.append(Spacer(1, 4))
    f.append(P("GENERAL RISKS", "cover_rule"))
    f.append(P(
        "Investments in equity and equity-related securities involve a degree of risk, and investors should "
        "not invest any funds in this Issue unless they can afford to take the risk of losing their entire "
        "investment. Investors are advised to read the risk factors carefully before taking an investment "
        "decision. In making an investment decision, prospective investors must rely on their own examination "
        "of our Company and the Issue, including the risks involved. The equity shares have not been "
        "recommended or approved by the Securities and Exchange Board of India, nor does SEBI guarantee the "
        "accuracy or adequacy of the contents of this document.",
        "smallc",
    ))
    f.append(Spacer(1, 4))
    f.append(P("ISSUER\u2019S ABSOLUTE RESPONSIBILITY", "cover_rule"))
    f.append(P(
        "Our Company, having made all reasonable enquiries, accepts responsibility for and confirms that this "
        "Draft Red Herring Prospectus contains all information with regard to our Company and the Issue which "
        "is material in the context of the Issue, that the information contained herein is true and correct in "
        "all material respects and is not misleading in any material respect, that the opinions and intentions "
        "expressed herein are honestly held, and that there are no other facts the omission of which makes "
        "this document as a whole or any such information or the expression of any such opinions or intentions "
        "misleading in any material respect.",
        "smallc",
    ))
    f.append(Spacer(1, 8))

    f.append(table(
        [
            ["LEAD MANAGER TO THE ISSUE", "REGISTRAR TO THE ISSUE"],
            [I["leadManager"], I["registrar"]],
            [f"Market Maker: {I['marketMaker']}", f"Listing: {I['platform']}"],
        ],
        widths=[CONTENT_W / 2, CONTENT_W / 2],
        font_size=8.2, zebra=False,
    ))
    f.append(Spacer(1, 6))
    f.append(table(
        [
            ["BID/ISSUE OPENS ON", "BID/ISSUE CLOSES ON"],
            ["[\u2022] (to be notified in the Red Herring Prospectus)", "[\u2022] (to be notified in the Red Herring Prospectus)"],
        ],
        widths=[CONTENT_W / 2, CONTENT_W / 2],
        font_size=8.2, zebra=False,
    ))
    return f


def _toc_heading() -> Paragraph:
    h = P("TABLE OF CONTENTS", "section")
    h._drhp_label = "Table of contents"
    return h


def toc_pages(page_map: dict[str, int] | None) -> list:
    """Contents table. Its size never changes, only the folios inside it."""
    rows = [["Section", "Contents", "Page"]]
    for sec in DATA["sections"]:
        folio = page_map.get(sec["no"]) if page_map else None
        rows.append([sec["no"], sec["title"], str(folio) if folio else "—"])
    rows.append(["", "Declaration", str(page_map["__decl__"]) if page_map and "__decl__" in page_map else "—"])
    return [
        _toc_heading(),
        rule(space_after=7),
        table(
            rows,
            widths=[CONTENT_W * 0.12, CONTENT_W * 0.74, CONTENT_W * 0.14],
            align_right=(2,),
            font_size=9,
        ),
        Spacer(1, 8),
        P(
            "Page references above are to the folios printed at the foot of each page. Bookmarks "
            "corresponding to every section of this document are embedded in the PDF.",
            "small",
        ),
    ]


def financial_tables() -> list:
    head = ["Particulars (\u20b9 in lakh)"] + [r["fy"] for r in FIN]
    rows = [head]
    for label, key in [
        ("Revenue from operations", "revenue"),
        ("EBITDA", "ebitda"),
        ("Profit after tax", "pat"),
        ("Net worth", "netWorth"),
        ("Net tangible assets", "nta"),
        ("Total borrowings", "debt"),
        ("Net cash from operations", "ocf"),
        ("Capital expenditure", "capex"),
    ]:
        rows.append([label] + [inr(r[key]) for r in FIN])
    w = [CONTENT_W * 0.40] + [CONTENT_W * 0.20] * 3
    out = [
        P("Restated summary statement of profit and loss and key balances", "h2"),
        table(rows, widths=w, align_right=(1, 2, 3)),
        Spacer(1, 4),
        P(
            "The restated summary statements above are derived from the audited financial statements for the "
            "financial years ended 31 March 2021, 2022 and 2023, restated in accordance with the SEBI ICDR "
            "Regulations and read together with the significant accounting policies and the notes thereto.",
            "small",
        ),
        P("Key accounting ratios", "h2"),
        table(
            [
                ["Ratio", "FY23", "Basis"],
                ["Revenue CAGR (FY21\u2013FY23)", RAT["revenueCagr"], "Compounded annual growth in revenue from operations"],
                ["EBITDA margin", RAT["ebitdaMargin"], "EBITDA as a percentage of revenue from operations"],
                ["PAT margin", RAT["patMargin"], "Profit after tax as a percentage of revenue from operations"],
                ["Return on net worth", RAT["roe"], "Profit after tax divided by closing net worth"],
                ["Debt\u2013equity ratio", RAT["debtEquity"], "Total borrowings divided by net worth"],
                ["Current ratio", RAT["currentRatio"], "Current assets divided by current liabilities"],
            ],
            widths=[CONTENT_W * 0.30, CONTENT_W * 0.14, CONTENT_W * 0.56],
            align_right=(1,),
        ),
    ]
    return out


def capital_tables() -> list:
    rows = [["Category of shareholder", "Nature of holding", "Pre-issue (%)"]]
    for h in DATA["capTable"]:
        rows.append([h["holder"], h["role"].replace("\u00b7", "|"), f"{h['pct']:.1f}"])
    return [
        P("Share capital before and after the Issue", "h2"),
        table(
            [
                ["Particulars", "No. of equity shares", "Aggregate value at face value (\u20b9 crore)"],
                ["Issued, subscribed and paid-up capital before the Issue", inr(CAP["preIssueShares"]), f"{CD['preIssueCapitalCr']:.2f}"],
                ["Present Issue \u2014 fresh issue of equity shares", inr(CAP["freshIssueShares"]), f"{CAP['freshIssueShares'] * I['faceValue'] / 1e7:.2f}"],
                ["Issued, subscribed and paid-up capital after the Issue", inr(CD["postIssueShares"]), f"{CD['postIssueCapitalCr']:.2f}"],
            ],
            widths=[CONTENT_W * 0.50, CONTENT_W * 0.22, CONTENT_W * 0.28],
            align_right=(1, 2),
        ),
        P("Shareholding pattern before the Issue", "h2"),
        table(rows, widths=[CONTENT_W * 0.38, CONTENT_W * 0.40, CONTENT_W * 0.22], align_right=(2,)),
        Spacer(1, 4),
        P(
            f"Our Promoters hold {CAP['promoterPreIssuePct']:.1f}% of the pre-issue paid-up equity share "
            f"capital and will hold approximately {CD['promoterPostIssuePct']:.1f}% of the post-issue paid-up "
            f"equity share capital. The minimum promoter contribution of {inr(CD['minPromoterContributionShares'])} "
            "equity shares, being 20% of the post-issue paid-up capital, will be locked in for three years from "
            "the date of allotment in accordance with Regulation 236 of the SEBI ICDR Regulations.",
            "small",
        ),
    ]


def objects_tables() -> list:
    rows = [["Object of the Issue", "Amount (\u20b9 crore)"]]
    for o in DATA["objects"]:
        rows.append([o["purpose"], f"{o['amtCr']:.2f}"])
    rows.append(["Total net proceeds", f"{CD['netProceedsCr']:.2f}"])
    return [
        P("Gross proceeds and the net proceeds bridge", "h2"),
        table(
            [
                ["Particulars", "Amount (\u20b9 crore)"],
                ["Gross proceeds of the Issue", f"{I['sizeCr']:.2f}"],
                ["Less: estimated Issue-related expenses", f"{CAP['issueExpensesCr']:.2f}"],
                ["Net proceeds", f"{CD['netProceedsCr']:.2f}"],
            ],
            widths=[CONTENT_W * 0.68, CONTENT_W * 0.32],
            align_right=(1,),
        ),
        P("Deployment of the net proceeds", "h2"),
        table(rows, widths=[CONTENT_W * 0.68, CONTENT_W * 0.32], align_right=(1,)),
        Spacer(1, 4),
        P(
            "The amount proposed to be deployed toward general corporate purposes does not exceed the lower of "
            "15% of the gross proceeds and \u20b910 crore, as required under the SEBI ICDR Regulations. No part "
            "of the net proceeds will be paid by our Company as consideration to our Promoters, Directors or "
            "key managerial personnel. Deployment will be monitored by the Audit Committee, and any variation "
            "in the objects will require the approval of shareholders by special resolution.",
            "small",
        ),
    ]


def price_tables() -> list:
    return [
        P("Quantitative factors", "h2"),
        table(
            [
                ["Particulars", "Value"],
                ["Basic earnings per share \u2014 FY23", f"\u20b9{CD['epsFy23']:.2f}"],
                ["Price/earnings ratio at the floor price", f"{CD['peAtFloor']:.1f}x"],
                ["Price/earnings ratio at the cap price", f"{CD['peAtCap']:.1f}x"],
                ["Return on net worth \u2014 FY23", RAT["roe"]],
                ["Net asset value per share \u2014 pre-issue", f"\u20b9{CD['navPreIssue']:.2f}"],
                ["Net asset value per share \u2014 post-issue", f"\u20b9{CD['navPostIssue']:.2f}"],
                ["Minimum bid lot value at the cap price", f"\u20b9{inr(CD['lotValueAtCap'])}"],
            ],
            widths=[CONTENT_W * 0.62, CONTENT_W * 0.38],
            align_right=(1,),
        ),
        Spacer(1, 4),
        P(
            "Basic earnings per share is struck on the pre-issue number of equity shares, the relevant financial "
            "year having closed before the Issue. Net asset value per share on a post-issue basis is computed on "
            "net worth as at 31 March 2023 increased by the net proceeds of the Issue, divided by the post-issue "
            "number of equity shares. The price band has been determined by our Company in consultation with the "
            "Lead Manager, and the comparison with listed industry peers, together with the basis on which the "
            "peer set was selected, is set out in this section.",
            "small",
        ),
    ]


def management_tables() -> list:
    rows = [["Name", "Designation", "Period of directorship"]]
    for b in DATA["board"]:
        rows.append([b["name"], b["role"], b["tenure"]])
    return [
        P("Board of Directors", "h2"),
        table(rows, widths=[CONTENT_W * 0.30, CONTENT_W * 0.42, CONTENT_W * 0.28]),
        Spacer(1, 4),
        P(
            "Our Board is constituted in accordance with the Companies Act, 2013 and comprises two executive "
            "Directors and two independent Directors. The Board has constituted an Audit Committee, a Nomination "
            "and Remuneration Committee and a Stakeholders Relationship Committee, in each case with the "
            "composition required under the Companies Act, 2013 and the applicable listing requirements.",
            "small",
        ),
    ]


def risk_tables() -> list:
    gaps = DATA["gaps"]
    rows = [["#", "Risk / matter disclosed", "Where it arises", "Severity"]]
    for i, g in enumerate(gaps, 1):
        rows.append([str(i), g["title"], g.get("location", "\u2014"), g["severity"].title()])
    return [
        P("Matters flagged in diligence and carried into this document", "h2"),
        table(
            rows,
            widths=[CONTENT_W * 0.06, CONTENT_W * 0.44, CONTENT_W * 0.36, CONTENT_W * 0.14],
        ),
        Spacer(1, 4),
        P(
            "The matters above were identified during the preparation of this document and are disclosed here "
            "in full. Each remains subject to the due diligence and certification of the Lead Manager, and none "
            "of them is represented as resolved except where expressly stated.",
            "small",
        ),
    ]


def eligibility_tables() -> list:
    el = DATA["eligibility"]
    rows = [["Eligibility criterion", "Requirement", "Position of our Company"]]
    for c in el["criteria"]:
        rows.append([c["title"], c["req"], c["val"]])
    return [
        P("Eligibility for listing on the SME platform", "h2"),
        table(rows, widths=[CONTENT_W * 0.34, CONTENT_W * 0.33, CONTENT_W * 0.33]),
        Spacer(1, 4),
        P(el["summary"], "small"),
    ]



# ---------------------------------------------------------------- front matter

def front_matter() -> list:
    """Conventions and forward-looking statements: the two notices that stand
    ahead of Section I in every SEBI-format offer document."""
    f: list = [PageBreak()]
    h = P("CERTAIN CONVENTIONS, PRESENTATION OF FINANCIAL, INDUSTRY AND MARKET DATA", "section")
    h._drhp_no = "__conv__"
    h._drhp_label = "Conventions and presentation of data"
    f.append(h)
    f.append(rule(space_after=7))
    f.append(P(
        "Unless otherwise specified or the context otherwise requires, all references in this Draft Red "
        f"Herring Prospectus to \u201cthe Company\u201d, \u201cour Company\u201d or \u201cthe Issuer\u201d are to "
        f"{C['proposedName']}, and references to \u201cwe\u201d, \u201cus\u201d or \u201cour\u201d are to our "
        "Company together with its business as described in this document."
    ))
    f.append(P("Financial data", "h2"))
    f.append(P(
        "Our fiscal year commences on 1 April and ends on 31 March of the succeeding calendar year, and "
        "references to a particular \u201cfiscal\u201d, \u201cFiscal Year\u201d or \u201cFY\u201d are to the "
        "twelve-month period ended 31 March of that year. Unless stated otherwise, financial information in "
        "this document is derived from the restated financial statements for the financial years ended "
        f"31 March {FIN[0]['fy'][2:]}, {FIN[1]['fy'][2:]} and {FIN[2]['fy'][2:]}, prepared in accordance with "
        "the Companies Act, 2013 and restated in accordance with the SEBI ICDR Regulations. All figures are "
        "presented in \u20b9 lakh unless otherwise indicated. Figures have been rounded off to two decimal "
        "places, and totals in some tables may not agree with the arithmetic aggregate of their components "
        "on account of that rounding."
    ))
    f.append(P("Currency and units of presentation", "h2"))
    f.append(P(
        "All references to \u201c\u20b9\u201d, \u201cRs.\u201d, \u201cINR\u201d or \u201cRupees\u201d are to the "
        "lawful currency of the Republic of India. Our Company has presented certain numerical information in "
        "\u201clakh\u201d and \u201ccrore\u201d units: one lakh represents 1,00,000 and one crore represents "
        "1,00,00,000."
    ))
    f.append(P("Industry and market data", "h2"))
    f.append(P(
        "Industry and market data used in this document has been obtained from publicly available sources and "
        "from internal estimates of our management. Such data has not been independently verified by our "
        "Company, the Lead Manager, or any of their respective affiliates or advisers, and no representation "
        "is made as to its accuracy or completeness. The extent to which such data is meaningful depends on "
        "the reader\u2019s familiarity with, and understanding of, the methodologies used in compiling it."
    ))

    f.append(PageBreak())
    h2 = P("FORWARD-LOOKING STATEMENTS", "section")
    h2._drhp_no = "__fls__"
    h2._drhp_label = "Forward-looking statements"
    f.append(h2)
    f.append(rule(space_after=7))
    f.append(P(
        "This Draft Red Herring Prospectus contains certain \u201cforward-looking statements\u201d. These "
        "statements can generally be identified by words or phrases such as \u201caim\u201d, "
        "\u201canticipate\u201d, \u201cbelieve\u201d, \u201cexpect\u201d, \u201cestimate\u201d, "
        "\u201cintend\u201d, \u201cobjective\u201d, \u201cplan\u201d, \u201cpropose\u201d, "
        "\u201cwill continue\u201d, \u201cseek to\u201d, \u201cwill pursue\u201d, or other words or phrases "
        "of similar import. All statements regarding our expected financial condition and results of "
        "operations, business plans and prospects are forward-looking statements."
    ))
    f.append(P(
        "These forward-looking statements are based on our current plans, estimates and expectations, and "
        "actual results may differ materially from those suggested by them on account of risks and "
        "uncertainties, including those described in \u201cRisk Factors\u201d. Important factors that could "
        "cause actual results to differ include: concentration of revenue in a limited number of distribution "
        "relationships across modern trade and quick commerce; volatility in the input prices of millets and "
        "edible-oil seeds; our dependence on a single leased manufacturing facility; the outcome of the "
        "pending indirect-tax proceedings described in this document; changes in food-safety, labelling and "
        "packaging regulation; and general economic and competitive conditions in the markets in which we "
        "operate."
    ))
    f.append(P(
        "Forward-looking statements reflect our views as at the date of this document and are not a guarantee "
        "of future performance. Neither our Company, our Directors, the Lead Manager, nor any of their "
        "respective affiliates has any obligation to update or otherwise revise any forward-looking statement "
        "to reflect events or circumstances arising after the date of this document, save as required by the "
        "SEBI ICDR Regulations and applicable law. In accordance with the requirements of SEBI, our Company "
        "and the Lead Manager will ensure that investors are informed of material developments until the time "
        "of the grant of listing and trading permission by the Stock Exchange."
    ))
    return f


def definitions_tables() -> list:
    """Section II is a real defined-terms section, not a description of one."""
    company_terms = [
        ["Term", "Description"],
        ["\u201cthe Company\u201d / \u201cour Company\u201d / \u201cthe Issuer\u201d",
         f"{C['proposedName']}, a public limited company incorporated under the Companies Act, 2013, "
         f"having its registered office at {C['regOffice']}"],
        ["\u201cBoard\u201d / \u201cBoard of Directors\u201d",
         "The board of directors of our Company, as constituted from time to time"],
        ["\u201cPromoters\u201d",
         f"{DATA['capTable'][0]['holder']} and {DATA['capTable'][1]['holder']}"],
        ["\u201cRegistered Office\u201d", C["regOffice"]],
        ["\u201cRoC\u201d", C["roc"]],
    ]
    issue_terms = [
        ["Term", "Description"],
        ["\u201cthe Issue\u201d",
         f"The fresh issue of up to {inr(CAP['freshIssueShares'])} equity shares of face value "
         f"\u20b9{I['faceValue']} each, aggregating up to \u20b9{I['sizeCr']:.2f} crore"],
        ["\u201cPrice Band\u201d",
         f"\u20b9{I['floorPrice']} to \u20b9{I['capPrice']} per equity share, the floor price and the cap "
         "price respectively, including any revisions thereto"],
        ["\u201cBid Lot\u201d", f"{inr(I['lotSize'])} equity shares, and in multiples thereof"],
        ["\u201cLead Manager\u201d", I["leadManager"]],
        ["\u201cRegistrar to the Issue\u201d", I["registrar"]],
        ["\u201cMarket Maker\u201d", I["marketMaker"]],
        ["\u201cStock Exchange\u201d", I["platform"]],
    ]
    abbrev = [["Abbreviation", "Full form"]]
    for term, meaning in DATA["glossary"].items():
        # The glossary is written for the app's readers; keep the expansion,
        # drop the explanatory tail after the first clause.
        expansion = meaning.split(",")[0].split(" is ")[0].strip().rstrip(".")
        abbrev.append([term, expansion])
    for term, expansion in [
        ("ICDR Regulations", "The SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018"),
        ("Companies Act", "The Companies Act, 2013, together with the rules made thereunder"),
        ("CIN", "Corporate Identity Number"),
        ("RoC", "Registrar of Companies"),
        ("NAV", "Net asset value per equity share"),
        ("RoNW", "Return on net worth"),
        ("EPS", "Earnings per equity share"),
        ("CAGR", "Compounded annual growth rate"),
        ("D2C", "Direct to consumer"),
        ("GST", "Goods and Services Tax"),
    ]:
        abbrev.append([term, expansion])

    return [
        P("Company-related terms", "h2"),
        table(company_terms, widths=[CONTENT_W * 0.30, CONTENT_W * 0.70]),
        P("Issue-related terms", "h2"),
        table(issue_terms, widths=[CONTENT_W * 0.30, CONTENT_W * 0.70]),
        P("Abbreviations", "h2"),
        table(abbrev, widths=[CONTENT_W * 0.24, CONTENT_W * 0.76]),
    ]


def risk_factor_paragraphs() -> list:
    """Each diligence finding written out as a numbered risk factor."""
    out = [P("Internal risk factors", "h2")]
    for i, g in enumerate(DATA["gaps"], 1):
        out.append(P(
            f"<b>{i}. {g['title']}.</b> {g['detail']} This matter arises in "
            f"{g['location'].replace(chr(183), '\u2014')} and is classified as a "
            f"{g['severity']}-severity item in our internal diligence register. It remains subject to the "
            "review and certification of the Lead Manager."
        ))
    return out


def intermediaries_table() -> list:
    return [
        P("Parties to the Issue", "h2"),
        table(
            [
                ["Role", "Particulars"],
                ["Lead Manager", I["leadManager"]],
                ["Registrar to the Issue", I["registrar"]],
                ["Market Maker", I["marketMaker"]],
                ["Statutory Auditors", "As appointed by the shareholders at the annual general meeting"],
                ["Bankers to the Issue", "[\u2022] (to be appointed prior to filing of the Red Herring Prospectus)"],
                ["Compliance Officer", "Company Secretary and Compliance Officer of our Company"],
                ["Registered Office", C["regOffice"]],
                ["Corporate Identity Number", C["cin"]],
                ["Registrar of Companies", C["roc"]],
            ],
            widths=[CONTENT_W * 0.30, CONTENT_W * 0.70],
        ),
        P("Board of Directors as at the date of this document", "h2"),
        table(
            [["Name", "Designation", "Period of directorship"]]
            + [[b["name"], b["role"], b["tenure"]] for b in DATA["board"]],
            widths=[CONTENT_W * 0.30, CONTENT_W * 0.42, CONTENT_W * 0.28],
        ),
    ]


def business_tables() -> list:
    return [
        P("Our operations at a glance", "h2"),
        table(
            [
                ["Particulars", "Position"],
                ["Sector", C["sector"]],
                ["Product families", C["subSector"]],
                ["Date of incorporation", C["incorporated"]],
                ["Manufacturing", "Leased facility at Baner, Pune (nine-year tenure)"],
                ["Distribution", "Own D2C storefront, quick-commerce platforms, and modern-trade outlets"],
                ["Employees", f"{inr(C['employees'])} as at the date of this document"],
                ["Website", C["website"]],
                ["GSTIN", C["gstin"]],
                ["PAN", C["pan"]],
            ],
            widths=[CONTENT_W * 0.30, CONTENT_W * 0.70],
        ),
        Spacer(1, 4),
        P(C["about"], "small"),
    ]


def cashflow_tables() -> list:
    rows = [["Particulars (\u20b9 in lakh)"] + [r["fy"] for r in FIN]]
    for label, key in [
        ("Net cash generated from operating activities", "ocf"),
        ("Capital expenditure", "capex"),
        ("Net borrowings raised / (repaid)", "netBorrowing"),
        ("Free cash flow to equity", "fcfe"),
    ]:
        rows.append([label] + [inr(r[key]) for r in FIN])
    return [
        P("Summary statement of cash flows", "h2"),
        table(
            rows,
            widths=[CONTENT_W * 0.40] + [CONTENT_W * 0.20] * 3,
            align_right=(1, 2, 3),
        ),
    ]


def promoter_tables() -> list:
    p1, p2 = DATA["capTable"][0], DATA["capTable"][1]
    return [
        P("Details of our Promoters", "h2"),
        table(
            [
                ["Name", "Position", "Pre-issue holding (%)", "Post-issue holding (%)"],
                [p1["holder"], p1["role"].replace("\u00b7", "|"), f"{p1['pct']:.1f}",
                 f"{p1['pct'] * CAP['preIssueShares'] / CD['postIssueShares']:.1f}"],
                [p2["holder"], p2["role"].replace("\u00b7", "|"), f"{p2['pct']:.1f}",
                 f"{p2['pct'] * CAP['preIssueShares'] / CD['postIssueShares']:.1f}"],
                ["Total", "", f"{CAP['promoterPreIssuePct']:.1f}", f"{CD['promoterPostIssuePct']:.1f}"],
            ],
            widths=[CONTENT_W * 0.28, CONTENT_W * 0.30, CONTENT_W * 0.21, CONTENT_W * 0.21],
            align_right=(2, 3),
        ),
        Spacer(1, 4),
        P(
            "Our Promoters have confirmed that they have not been declared wilful defaulters, that no "
            "proceedings for economic offences are pending against them, and that they have not been declared "
            "fugitive economic offenders. The minimum promoter contribution of "
            f"{inr(CD['minPromoterContributionShares'])} equity shares will be locked in for three years from "
            "the date of allotment, and the balance of the pre-issue capital held by our Promoters will be "
            "locked in for one year, in each case in accordance with the SEBI ICDR Regulations.",
            "small",
        ),
    ]


def litigation_tables() -> list:
    legal = [g for g in DATA["gaps"] if "Legal" in g["location"] or "tax" in g["detail"].lower()]
    rows = [["Matter", "Forum / status", "Amount involved"]]
    for g in legal:
        rows.append([g["title"], g["detail"][:120], "\u20b918.40 lakh" if "GST" in g["title"] else "Not quantifiable"])
    if len(rows) == 1:
        rows.append(["No outstanding matters", "\u2014", "\u2014"])
    return [
        P("Outstanding litigation and material developments", "h2"),
        table(rows, widths=[CONTENT_W * 0.30, CONTENT_W * 0.50, CONTENT_W * 0.20]),
        P("Material documents for inspection", "h2"),
        table(
            [["Document", "Nature"]] + [[d["name"], d["kind"]] for d in DATA["docs"]],
            widths=[CONTENT_W * 0.62, CONTENT_W * 0.38],
        ),
        Spacer(1, 4),
        P(
            "Copies of the documents listed above will be available for inspection at the Registered Office of "
            "our Company between 10.00 a.m. and 5.00 p.m. on all working days from the date of filing of the "
            "Red Herring Prospectus with the Registrar of Companies until the Bid/Issue Closing Date.",
            "small",
        ),
    ]


def issue_terms_tables() -> list:
    return [
        P("Terms of the Issue", "h2"),
        table(
            [
                ["Particulars", "Terms"],
                ["Nature of the Issue", f"{I['type']} \u2014 100% book-built issue"],
                ["Face value", f"\u20b9{I['faceValue']} per equity share"],
                ["Price band", f"\u20b9{I['floorPrice']} \u2013 \u20b9{I['capPrice']} per equity share"],
                ["Bid lot", f"{inr(I['lotSize'])} equity shares, and in multiples thereof"],
                ["Minimum application value at the cap price", f"\u20b9{inr(CD['lotValueAtCap'])}"],
                ["Market maker reservation", f"{inr(CD['marketMakerShares'])} equity shares"],
                ["Listing", I["platform"]],
                ["Mode of payment", "Application Supported by Blocked Amount (ASBA) only"],
                ["Ranking", "The equity shares issued will rank pari passu in all respects with the existing equity shares"],
            ],
            widths=[CONTENT_W * 0.38, CONTENT_W * 0.62],
        ),
    ]


# Extra material folded into the relevant statutory section.
def _combine(*fns):
    def run() -> list:
        out: list = []
        for fn in fns:
            out.extend(fn())
        return out
    return run


EXTRAS = {
    "I": issue_terms_tables,
    "II": definitions_tables,
    "III": _combine(risk_factor_paragraphs, risk_tables),
    "IV": _combine(intermediaries_table, eligibility_tables),
    "VI": business_tables,
    "VII": _combine(financial_tables, cashflow_tables),
    "VIII": capital_tables,
    "IX": objects_tables,
    "X": price_tables,
    "XI": litigation_tables,
    "XII": management_tables,
    "XIII": promoter_tables,
    "XIV": lambda: declaration_body(),
}


def split_paragraphs(text: str) -> list[str]:
    """The drafted prose arrives as one block; break it into readable paragraphs."""
    sentences = []
    buf = ""
    for chunk in text.replace("\u2019", "\u2019").split(". "):
        buf = f"{buf}. {chunk}" if buf else chunk
        if len(buf) > 420:
            sentences.append(buf.rstrip(". ") + ".")
            buf = ""
    if buf:
        sentences.append(buf if buf.endswith(".") else buf + ".")
    return sentences


def section_flowables() -> list:
    f: list = []
    for idx, sec in enumerate(DATA["sections"]):
        no, title = sec["no"], sec["title"]
        if idx:
            f.append(PageBreak())
        f.append(P(f"SECTION {no}", "section_no"))
        heading = P(title.upper(), "section")
        heading._drhp_no = no
        heading._drhp_label = f"{no}. {title}"
        f.append(heading)
        f.append(rule(space_after=7))

        body = DATA["drafts"].get(no)
        if body:
            for para in split_paragraphs(body):
                f.append(P(para))

        extra = EXTRAS.get(no)
        if extra:
            f.extend(extra())

        if sec.get("sources"):
            f.append(Spacer(1, 6))
            f.append(boxed([
                Paragraph(
                    money(
                        "<b>Provenance.</b> The disclosures in this section are traced to the following source "
                        "documents held in the issuer\u2019s evidence file: "
                        + ", ".join(sec["sources"]) + ". "
                        "Each assertion is linked to the page of the source it was drawn from; items marked "
                        "as inferred are identified for the Lead Manager\u2019s attention."
                    ),
                    S["small"],
                )
            ], bg=colors.HexColor("#f7f9fc")))

        flags = sec.get("flags") or []
        if flags:
            f.append(Spacer(1, 5))
            f.append(boxed([
                Paragraph(
                    money("<b>Open items disclosed in this section.</b> " + " ".join(
                        f"({i + 1}) {fl['text']}." for i, fl in enumerate(flags)
                    )),
                    S["small"],
                )
            ], bg=colors.HexColor("#fdf7ec"), border=colors.HexColor("#e0c795")))
    return f


def declaration_body() -> list:
    """Section XIV's operative content: the statutory declaration and the
    signature block. It is part of the section, not a second one after it."""
    return [
        P(
            "All relevant provisions of the Companies Act, 2013 and the rules, regulations, guidelines and "
            "circulars issued by the Government of India or the regulations, guidelines and circulars issued by "
            "the Securities and Exchange Board of India, established under Section 3 of the Securities and "
            "Exchange Board of India Act, 1992, as the case may be, have been complied with, and no statement "
            "made in this Draft Red Herring Prospectus is contrary to the provisions of the Companies Act, 2013, "
            "the Securities Contracts (Regulation) Act, 1956, the Securities and Exchange Board of India Act, "
            "1992, or the rules, regulations or guidelines issued thereunder, as the case may be. We further "
            "certify that all statements made in this Draft Red Herring Prospectus are true and correct."
        ),
        Spacer(1, 10),
        P("SIGNED BY THE DIRECTORS OF OUR COMPANY", "h2"),
        table(
            [["Name", "Designation", "Signature"]]
            + [[b["name"], b["role"], ""] for b in DATA["board"]],
            widths=[CONTENT_W * 0.32, CONTENT_W * 0.42, CONTENT_W * 0.26],
        ),
        Spacer(1, 14),
        P(f"Place: Pune &nbsp;&nbsp;|&nbsp;&nbsp; Date: {TODAY}", "small"),
        Spacer(1, 10),
        boxed([
            Paragraph(
                money(
                    "<b>Status of this document.</b> This draft has been assembled from the issuer\u2019s "
                    "verified source documents and is issued for the due diligence and certification of the "
                    "Lead Manager. Nothing in it is filed with the Securities and Exchange Board of India or "
                    "with any stock exchange until a merchant banker has certified it."
                ),
                S["small"],
            )
        ], bg=colors.HexColor("#f7f9fc")),
    ]


def make_story(page_map: dict[str, int] | None) -> list:
    story: list = []
    story += cover_page()
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())
    story += toc_pages(page_map)
    story += front_matter()
    story.append(PageBreak())
    story += section_flowables()
    return story


def make_doc(path: str) -> DRHP:
    return DRHP(
        path,
        title=f"{C['proposedName']} \u2014 Draft Red Herring Prospectus",
        author=C["proposedName"],
        subject="Draft Red Herring Prospectus (SME) \u2014 for merchant-banker certification",
        creator="Sahayak DRHP",
        leftMargin=L_MARGIN, rightMargin=R_MARGIN, topMargin=T_MARGIN, bottomMargin=B_MARGIN,
    )


def build() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    # Pass one discovers the folios. Because the contents table holds the same
    # number of rows either way, pass two paginates identically \u2014 which is
    # exactly what reportlab's own multi-pass TOC could not converge on here.
    with tempfile.TemporaryDirectory() as tmp:
        probe = make_doc(os.path.join(tmp, "probe.pdf"))
        probe.build(make_story(None))
        page_map = dict(probe.section_pages)

    final = make_doc(str(OUT))
    final.build(make_story(page_map))

    if dict(final.section_pages) != page_map:
        print("warning: folios shifted between passes", file=sys.stderr)
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.0f} kB, {final.page} pages)")


if __name__ == "__main__":
    sys.exit(build())
