from fpdf import FPDF

from repositories.summary_repository import SummaryRepository

_FIELDS = (
    ("orderId", "Order ID"),
    ("createdAt", "Created at"),
    ("price", "Price"),
    ("description", "Description"),
    ("lastModifiedAt", "Last modified at"),
)


class SummaryService:
    def __init__(self, repository: SummaryRepository):
        self.repository = repository

    def create_summary(self) -> dict:
        orders = [_parse_order(text) for text in self.repository.list_order_texts()]
        orders.sort(key=lambda order: order["createdAt"])
        url = self.repository.save_pdf(_build_pdf(orders))
        return {"url": url}


def _parse_order(text: str) -> dict:
    values = {}
    for line in text.splitlines():
        if ": " not in line:
            continue
        name, value = line.split(": ", 1)
        values[name] = value
    return {name: values.get(name, "") for name, _label in _FIELDS}


def _build_pdf(orders: list[dict]) -> bytes:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=16)
    pdf.multi_cell(0, 10, "Deleted orders summary")
    pdf.ln(2)
    pdf.set_font("Helvetica", size=12)
    if not orders:
        pdf.multi_cell(0, 8, "No deleted orders.")
        return bytes(pdf.output())

    for index, order in enumerate(orders, start=1):
        pdf.set_font("Helvetica", style="B", size=12)
        pdf.multi_cell(0, 8, f"Order {index}")
        pdf.set_font("Helvetica", size=11)
        for name, label in _FIELDS:
            pdf.multi_cell(0, 7, _pdf_text(f"{label}: {order[name]}"))
        pdf.ln(3)
    return bytes(pdf.output())


def _pdf_text(value: str) -> str:
    # Helvetica only covers Latin-1. Replace other characters instead of failing the API.
    return value.encode("latin-1", errors="replace").decode("latin-1")
