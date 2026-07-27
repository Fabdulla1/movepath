export function beginPremiumPrint() {
  document.body.dataset.printMode = 'premium'
  window.print()
  window.setTimeout(() => {
    delete document.body.dataset.printMode
  }, 0)
}
