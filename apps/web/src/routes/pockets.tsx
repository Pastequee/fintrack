import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'
import { PocketListCard } from '~/components/pocket/pocket-list-card'

export const Route = createFileRoute('/pockets')({
	component: PocketsPage,
})

function PocketsPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<PocketListCard />
			</main>
			<Footer />
		</div>
	)
}
