const currencyFormatter = new Intl.NumberFormat('fr-FR', {
	style: 'currency',
	currency: 'EUR',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})

export const formatCurrency = (amount: number) => currencyFormatter.format(amount)
