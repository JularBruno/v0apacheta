import { notFound } from 'next/navigation';

/**
 * wow vert not found
 * this folder is required because middleware and shity redirection
 */
export default function DashboardCatchAll() {
	notFound();
}