const currencyFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'EUR',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})

export const formatCurrency = (amount: number) => currencyFormatter.format(amount)
