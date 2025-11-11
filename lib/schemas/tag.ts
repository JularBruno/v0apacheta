/**
 * This file contains type definitions for Tag object
 */
// ✅ For posting data (client → server)
export type Tag = {
	id: string | undefined;
	name: string;
	categoryId: string;
	amount: number;
};

// ✅ For retrieved data (server → client)
export type Tags = Tag & {
	createdAt: string;
};
