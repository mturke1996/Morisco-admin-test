import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportElementToPDF(el: HTMLElement, filename='report.pdf'){
  const canvas = await html2canvas(el, { scale: 2 })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation:'p', unit:'mm', format:'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
  const w = canvas.width * ratio
  const h = canvas.height * ratio
  pdf.addImage(img, 'PNG', (pageWidth - w)/2, 10, w, h)
  pdf.save(filename)
}
