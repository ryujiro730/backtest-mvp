-- ===========================================
--   匿名投稿許可 + 荒らし対策（文字数制限）
-- ===========================================
-- 既存の 20260202000000_community 適用後に実行

-- user_id を NULL 許可（匿名投稿）
ALTER TABLE community_posts
  ALTER COLUMN user_id DROP NOT NULL;

-- 荒らし対策: タイトル・本文の長さ制限（初回マイグレーションで既に付与済みの場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'community_posts_title_length'
  ) THEN
    ALTER TABLE community_posts ADD CONSTRAINT community_posts_title_length CHECK (char_length(title) <= 200);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'community_posts_body_length'
  ) THEN
    ALTER TABLE community_posts ADD CONSTRAINT community_posts_body_length CHECK (char_length(body) <= 10000);
  END IF;
END $$;

-- 旧 INSERT ポリシーを削除し、匿名・認証どちらも投稿可能に
DROP POLICY IF EXISTS "community_posts_insert" ON community_posts;

CREATE POLICY "community_posts_insert"
  ON community_posts FOR INSERT
  TO public
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL)
    OR (user_id = auth.uid() AND auth.uid() IS NOT NULL)
  );

-- 更新・削除は「自分の投稿」のみ（user_id が NULL の匿名投稿は編集・削除不可）
-- 既存ポリシーの USING で user_id = auth.uid() なので、匿名投稿は user_id が null で一致せずそのまま保護される

COMMENT ON TABLE community_posts IS 'Delver community: posts by logged-in or anonymous users. Anon posts (user_id NULL) are immutable.';
