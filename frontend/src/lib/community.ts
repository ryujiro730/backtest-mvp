// Community features not available in standalone build
export type CommunityPost = { id: string; title: string; body: string; created_at: string; author_display: string | null; locale: string; user_id: string | null; updated_at: string; };
export type CommunityReply = { id: string; post_id: string; body: string; created_at: string; author_display: string | null; user_id: string | null; };
export async function getPosts(_locale: string): Promise<CommunityPost[]> { return []; }
export async function getPost(_id: string): Promise<CommunityPost | null> { return null; }
export async function getReplies(_postId: string): Promise<CommunityReply[]> { return []; }
export async function createPost(_: any): Promise<CommunityPost> { throw new Error("community disabled"); }
export async function createReply(_: any): Promise<CommunityReply> { throw new Error("community disabled"); }
