// app/dashboard/layout.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * 
 * Checks that user is logged, since auth was not pushing route
 * 
 */
function SessionChecker({ children }: { children: React.ReactNode }) {
	const { status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login')
		}
	}, [status, router])

	if (status === 'loading') return <div>Loading...</div>

	return <>{children}</>
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SessionProvider>
			<SessionChecker>
				{children}
			</SessionChecker>
		</SessionProvider>
	);
}