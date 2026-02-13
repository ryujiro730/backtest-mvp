-- ===========================================
--   コミュニティ投稿への返信
-- ===========================================

CREATE TABLE IF NOT EXISTS community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_display text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_replies_body_length CHECK (char_length(body) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_community_replies_post_id ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_created_at ON community_replies(created_at);

ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能
CREATE POLICY "community_replies_select"
  ON community_replies FOR SELECT
  USING (true);

-- 誰でも返信可能（匿名は user_id NULL）
CREATE POLICY "community_replies_insert"
  ON community_replies FOR INSERT
  TO public
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL)
    OR (user_id = auth.uid() AND auth.uid() IS NOT NULL)
  );

-- 自分の返信のみ更新・削除（匿名返信は不可）
CREATE POLICY "community_replies_update"
  ON community_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_replies_delete"
  ON community_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE community_replies IS 'Replies to community_posts. Anon replies (user_id NULL) are immutable.';
