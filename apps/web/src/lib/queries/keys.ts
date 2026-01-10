export const keys = {
	todos: {
		all: ['todos'] as const,
		list: () => [...keys.todos.all, 'list'] as const,
		item: (id: string) => [...keys.todos.all, 'item', id] as const,
	},
	incomes: {
		all: ['incomes'] as const,
		list: () => [...keys.incomes.all, 'list'] as const,
		item: (id: string) => [...keys.incomes.all, 'item', id] as const,
	},
	expenses: {
		all: ['expenses'] as const,
		list: () => [...keys.expenses.all, 'list'] as const,
		item: (id: string) => [...keys.expenses.all, 'item', id] as const,
	},
	pockets: {
		all: ['pockets'] as const,
		list: () => [...keys.pockets.all, 'list'] as const,
		item: (id: string) => [...keys.pockets.all, 'item', id] as const,
	},
	admin: {
		all: ['admin'] as const,
		users: {
			all: () => [...keys.admin.all, 'users'] as const,
			list: () => [...keys.admin.users.all(), 'list'] as const,
		},
	},
} as const
