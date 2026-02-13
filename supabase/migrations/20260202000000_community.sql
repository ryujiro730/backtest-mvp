-- ===========================================
--   C O M M U N I T Y   (Delver コミュニティ)
-- ===========================================
-- 投稿テーブル: ログイン不要で投稿可。匿名は user_id NULL。
-- RLS: 全員が読み取り、誰でも投稿、認証ユーザーが自分の投稿のみ編集・削除。
-- 荒らし対策は 20260202100000_community_anon_and_limits で文字数制限を追加。

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display text,
  title text NOT NULL,
  body text NOT NULL,
  locale text NOT NULL DEFAULT 'ja' CHECK (locale IN ('ja', 'en')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_posts_title_length CHECK (char_length(title) <= 200),
  CONSTRAINT community_posts_body_length CHECK (char_length(body) <= 10000)
);

CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_locale ON community_posts(locale);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能
CREATE POLICY "community_posts_select"
  ON community_posts FOR SELECT
  USING (true);

-- 誰でも投稿可能（匿名は user_id NULL、認証は user_id = auth.uid()）
CREATE POLICY "community_posts_insert"
  ON community_posts FOR INSERT
  TO public
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL)
    OR (user_id = auth.uid() AND auth.uid() IS NOT NULL)
  );

-- 自分の投稿のみ更新
CREATE POLICY "community_posts_update"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 自分の投稿のみ削除
CREATE POLICY "community_posts_delete"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION community_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS community_posts_updated_at ON community_posts;
CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION community_posts_updated_at();

COMMENT ON TABLE community_posts IS 'Delver community: user-generated posts (locale-aware).';
