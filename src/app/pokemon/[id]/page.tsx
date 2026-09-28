import { redirect } from 'next/navigation'

// The detail view is now rendered as a modal on the home dashboard.
// This route redirects back home for any direct URL access.
export default async function PokemonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // Redirect to home with a hash so the client can optionally open the modal
  redirect(`/?modal=${id}`)
}
