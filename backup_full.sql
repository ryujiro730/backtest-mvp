

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."community_posts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."community_posts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reserve_free_quota"("p_idem" "text" DEFAULT NULL::"text", "p_limit" integer DEFAULT 3, "p_tz" "text" DEFAULT 'Asia/Tokyo'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  uid uuid := auth.uid();
  today_jst date := (now() at time zone p_tz)::date;
  used int;
  plan_now text;
  limit_now int := coalesce(p_limit, 3);
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'no_auth');
  end if;

  insert into profiles (id, free_runs_used, free_last_date)
  values (uid, 0, today_jst)
  on conflict (id) do nothing;

  update profiles
     set free_runs_used = case when coalesce(free_last_date, today_jst) <> today_jst then 0 else free_runs_used end,
         free_last_date = today_jst
   where id = uid;

  select p.free_runs_used, p.plan into used, plan_now
    from profiles p where p.id = uid for update;

  if plan_now in ('pro','starter') then
    return jsonb_build_object('ok', true, 'remaining', 999, 'plan', plan_now);
  end if;

  if used >= limit_now then
    return jsonb_build_object('ok', false, 'reason', 'free_quota_exceeded', 'remaining', 0);
  end if;

  update profiles
     set free_runs_used = used + 1,
         free_last_date = today_jst
   where id = uid;

  return jsonb_build_object('ok', true, 'remaining', limit_now - (used + 1), 'plan', plan_now);
end $$;


ALTER FUNCTION "public"."reserve_free_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reserve_free_quota"("p_kind" "text", "p_user_id" "uuid", "p_anon_id" "text", "p_daily_limit" integer DEFAULT 3) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  used int;
  today date := (now() at time zone 'UTC')::date;
begin
  if p_user_id is null and (p_anon_id is null or length(p_anon_id) = 0) then
    return false;
  end if;

  if p_user_id is not null then
    select count(*) into used
    from public.sim_usage_logs
    where kind = p_kind
      and user_id = p_user_id
      and created_day = today;
  else
    select count(*) into used
    from public.sim_usage_logs
    where kind = p_kind
      and anon_id = p_anon_id
      and created_day = today;
  end if;

  if used >= p_daily_limit then
    return false;
  end if;

  insert into public.sim_usage_logs(user_id, anon_id, kind)
  values (p_user_id, p_anon_id, p_kind);

  return true;
end;
$$;


ALTER FUNCTION "public"."reserve_free_quota"("p_kind" "text", "p_user_id" "uuid", "p_anon_id" "text", "p_daily_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reserve_guest_quota"("p_guest" "text", "p_limit" integer, "p_tz" "text") RETURNS TABLE("ok" boolean)
    LANGUAGE "plpgsql"
    AS $$
declare
  today date := (now() at time zone p_tz)::date;
begin
  -- 行を作りつつ現在値をとる
  insert into guest_quotas (guest_id, day, used)
    values (p_guest, today, 0)
  on conflict (guest_id, day) do nothing;

  update guest_quotas
     set used = used + 1
   where guest_id = p_guest and day = today and used < p_limit;

  if found then
    return query select true;
  else
    return; -- 0行 = 予約失敗（上限超過）
  end if;
end $$;


ALTER FUNCTION "public"."reserve_guest_quota"("p_guest" "text", "p_limit" integer, "p_tz" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reserve_quota_v2"("p_subject" "text", "p_idem" "text", "p_limit" integer, "p_tz" "text") RETURNS TABLE("ok" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  d date := (now() at time zone p_tz)::date;
begin
  -- idem はここではダミー（必要なら別テーブルにユニーク記録）
  insert into public.run_quota_daily(day, subject, used)
  values (d, p_subject, 1)
  on conflict (day, subject) do update
    set used = public.run_quota_daily.used + 1
  returning true as ok;

  if (select used from public.run_quota_daily where day=d and subject=p_subject) > p_limit then
    -- 超過ならロールバックして ok を返さない等、設計に応じて
    delete from public.run_quota_daily where day=d and subject=p_subject and used > p_limit;
    return;
  end if;
end;
$$;


ALTER FUNCTION "public"."reserve_quota_v2"("p_subject" "text", "p_idem" "text", "p_limit" integer, "p_tz" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reserve_starter_quota"("p_idem" "text", "p_limit" integer DEFAULT 30, "p_tz" "text" DEFAULT 'Asia/Tokyo'::"text") RETURNS TABLE("used" integer, "period" "date")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  return query
  with p as (
    select (date_trunc('day', timezone(p_tz, now())))::date as period
  ),
  e as (
    insert into usage_events_daily(user_id, period, idem)
    select v_user, p.period, p_idem from p
    on conflict (user_id, period, idem) do nothing
    returning 1
  ),
  i as (
    insert into usage_counters_daily(user_id, period, used)
    select v_user, p.period, 0 from p
    on conflict (user_id, period) do nothing
    returning 1
  )
  update usage_counters_daily uc
  set used = uc.used + 1, updated_at = now()
  from p
  where uc.user_id = v_user
    and uc.period = p.period
    and exists (select 1 from e)       -- 新規 idem の時だけ増加
    and uc.used < p_limit              -- 上限ガード
  returning uc.used, p.period;
end;
$$;


ALTER FUNCTION "public"."reserve_starter_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."subscriptions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."subscriptions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


ALTER FUNCTION "public"."trg_set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."community_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "author_display" "text",
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "locale" "text" DEFAULT 'ja'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "community_posts_body_length" CHECK (("char_length"("body") <= 10000)),
    CONSTRAINT "community_posts_locale_check" CHECK (("locale" = ANY (ARRAY['ja'::"text", 'en'::"text"]))),
    CONSTRAINT "community_posts_title_length" CHECK (("char_length"("title") <= 200))
);


ALTER TABLE "public"."community_posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."community_posts" IS 'Delver community: posts by logged-in or anonymous users. Anon posts (user_id NULL) are immutable.';



CREATE TABLE IF NOT EXISTS "public"."community_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "author_display" "text",
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "community_replies_body_length" CHECK (("char_length"("body") <= 2000))
);


ALTER TABLE "public"."community_replies" OWNER TO "postgres";


COMMENT ON TABLE "public"."community_replies" IS 'Replies to community_posts. Anon replies (user_id NULL) are immutable.';



CREATE TABLE IF NOT EXISTS "public"."flow_states" (
    "state" "text" NOT NULL,
    "verifier" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "result_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."flow_states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guest_quotas" (
    "guest_id" "text" NOT NULL,
    "day" "date" NOT NULL,
    "used" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."guest_quotas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "plan" "text" DEFAULT 'free'::"text" NOT NULL,
    "stripe_customer_id" "text",
    "current_period_end" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."run_quota_daily" (
    "day" "date" NOT NULL,
    "subject" "text" NOT NULL,
    "used" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."run_quota_daily" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "anon_id" "uuid",
    "ip_hash" "text",
    "user_agent" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "pair" "text",
    "timeframe" "text",
    "params" "jsonb",
    "result_key" "text",
    "error_msg" "text",
    "run_id" "uuid" DEFAULT "gen_random_uuid"(),
    "sid" "text",
    "seed" integer,
    "code_hash" "text",
    "dataset_hash" "text",
    "payload" "jsonb",
    "equity_data" "jsonb",
    "trades_data" "jsonb",
    "idem_key" "text",
    "started_at" timestamp without time zone,
    "finished_at" timestamp without time zone,
    "error" "text",
    "pf" double precision,
    "winrate" double precision,
    "maxdd" double precision,
    "trades" integer,
    "expectancy" double precision,
    "avg_win" double precision,
    "avg_loss" double precision
);


ALTER TABLE "public"."runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shares" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "result_id" "text" NOT NULL,
    "tweet_id" "text" NOT NULL,
    "nonce" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."shares" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."shares_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."shares_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."shares_id_seq" OWNED BY "public"."shares"."id";



CREATE TABLE IF NOT EXISTS "public"."sim_usage_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "anon_id" "text",
    "kind" "text" DEFAULT 'trade-sim'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_day" "date" GENERATED ALWAYS AS ((("created_at" AT TIME ZONE 'UTC'::"text"))::"date") STORED
);


ALTER TABLE "public"."sim_usage_logs" OWNER TO "postgres";


ALTER TABLE "public"."sim_usage_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."sim_usage_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."stripe_customers" (
    "user_id" "uuid" NOT NULL,
    "customer_id" "text" NOT NULL
);


ALTER TABLE "public"."stripe_customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "text" NOT NULL,
    "user_id" "uuid",
    "status" "text" NOT NULL,
    "price_id" "text",
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "customer_id" "text" DEFAULT ''::"text" NOT NULL,
    "plan" "text",
    "current_period_start" timestamp with time zone
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_counters" (
    "user_id" "uuid" NOT NULL,
    "period" "date" NOT NULL,
    "used" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_counters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_counters_daily" (
    "user_id" "uuid" NOT NULL,
    "period" "date" NOT NULL,
    "used" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_counters_daily" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_events" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "period" "date" NOT NULL,
    "idem" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_events_daily" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "period" "date" NOT NULL,
    "idem" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_events_daily" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."usage_events_daily_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."usage_events_daily_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usage_events_daily_id_seq" OWNED BY "public"."usage_events_daily"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."usage_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."usage_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usage_events_id_seq" OWNED BY "public"."usage_events"."id";



ALTER TABLE ONLY "public"."shares" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shares_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."usage_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."usage_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."usage_events_daily" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."usage_events_daily_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_replies"
    ADD CONSTRAINT "community_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flow_states"
    ADD CONSTRAINT "flow_states_pkey" PRIMARY KEY ("state");



ALTER TABLE ONLY "public"."guest_quotas"
    ADD CONSTRAINT "guest_quotas_pkey" PRIMARY KEY ("guest_id", "day");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."run_quota_daily"
    ADD CONSTRAINT "run_quota_daily_pkey" PRIMARY KEY ("day", "subject");



ALTER TABLE ONLY "public"."runs"
    ADD CONSTRAINT "runs_idem_key_key" UNIQUE ("idem_key");



ALTER TABLE ONLY "public"."runs"
    ADD CONSTRAINT "runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."runs"
    ADD CONSTRAINT "runs_run_id_key" UNIQUE ("run_id");



ALTER TABLE ONLY "public"."shares"
    ADD CONSTRAINT "shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shares"
    ADD CONSTRAINT "shares_user_id_result_id_key" UNIQUE ("user_id", "result_id");



ALTER TABLE ONLY "public"."sim_usage_logs"
    ADD CONSTRAINT "sim_usage_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_customer_id_key" UNIQUE ("customer_id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_counters_daily"
    ADD CONSTRAINT "usage_counters_daily_pkey" PRIMARY KEY ("user_id", "period");



ALTER TABLE ONLY "public"."usage_counters"
    ADD CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("user_id", "period");



ALTER TABLE ONLY "public"."usage_events_daily"
    ADD CONSTRAINT "usage_events_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_events_daily"
    ADD CONSTRAINT "usage_events_daily_user_id_period_idem_key" UNIQUE ("user_id", "period", "idem");



ALTER TABLE ONLY "public"."usage_events"
    ADD CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_events"
    ADD CONSTRAINT "usage_events_user_id_period_idem_key" UNIQUE ("user_id", "period", "idem");



CREATE INDEX "idx_community_posts_created_at" ON "public"."community_posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_community_posts_locale" ON "public"."community_posts" USING "btree" ("locale");



CREATE INDEX "idx_community_posts_user_id" ON "public"."community_posts" USING "btree" ("user_id");



CREATE INDEX "idx_community_replies_created_at" ON "public"."community_replies" USING "btree" ("created_at");



CREATE INDEX "idx_community_replies_post_id" ON "public"."community_replies" USING "btree" ("post_id");



CREATE INDEX "idx_profiles_stripe_customer_id" ON "public"."profiles" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_runs_anon_id" ON "public"."runs" USING "btree" ("anon_id");



CREATE INDEX "idx_runs_created_at" ON "public"."runs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_runs_dataset_hash" ON "public"."runs" USING "btree" ("dataset_hash");



CREATE INDEX "idx_runs_run_id" ON "public"."runs" USING "btree" ("run_id");



CREATE INDEX "idx_runs_sid" ON "public"."runs" USING "btree" ("sid");



CREATE INDEX "idx_runs_status" ON "public"."runs" USING "btree" ("status");



CREATE INDEX "idx_runs_user_id" ON "public"."runs" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_customer_id" ON "public"."subscriptions" USING "btree" ("customer_id");



CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "runs_anon_month_idx" ON "public"."runs" USING "btree" ("anon_id", "created_at");



CREATE INDEX "runs_ip_month_idx" ON "public"."runs" USING "btree" ("ip_hash", "created_at");



CREATE INDEX "runs_user_created_idx" ON "public"."runs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "runs_user_month_idx" ON "public"."runs" USING "btree" ("user_id", "created_at");



CREATE INDEX "sim_usage_logs_anon_day_idx" ON "public"."sim_usage_logs" USING "btree" ("anon_id", "created_day");



CREATE INDEX "sim_usage_logs_user_day_idx" ON "public"."sim_usage_logs" USING "btree" ("user_id", "created_day");



CREATE OR REPLACE TRIGGER "community_posts_updated_at" BEFORE UPDATE ON "public"."community_posts" FOR EACH ROW EXECUTE FUNCTION "public"."community_posts_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."profiles_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."runs" FOR EACH ROW EXECUTE FUNCTION "public"."trg_set_updated_at"();



CREATE OR REPLACE TRIGGER "subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."subscriptions_updated_at"();



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_replies"
    ADD CONSTRAINT "community_replies_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_replies"
    ADD CONSTRAINT "community_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."runs"
    ADD CONSTRAINT "runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shares"
    ADD CONSTRAINT "shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_counters_daily"
    ADD CONSTRAINT "usage_counters_daily_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_counters"
    ADD CONSTRAINT "usage_counters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_events_daily"
    ADD CONSTRAINT "usage_events_daily_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_events"
    ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE "public"."community_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "community_posts_delete" ON "public"."community_posts" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "community_posts_insert" ON "public"."community_posts" FOR INSERT WITH CHECK (((("user_id" IS NULL) AND ("auth"."uid"() IS NULL)) OR (("user_id" = "auth"."uid"()) AND ("auth"."uid"() IS NOT NULL))));



CREATE POLICY "community_posts_select" ON "public"."community_posts" FOR SELECT USING (true);



CREATE POLICY "community_posts_update" ON "public"."community_posts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."community_replies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "community_replies_delete" ON "public"."community_replies" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "community_replies_insert" ON "public"."community_replies" FOR INSERT WITH CHECK (((("user_id" IS NULL) AND ("auth"."uid"() IS NULL)) OR (("user_id" = "auth"."uid"()) AND ("auth"."uid"() IS NOT NULL))));



CREATE POLICY "community_replies_select" ON "public"."community_replies" FOR SELECT USING (true);



CREATE POLICY "community_replies_update" ON "public"."community_replies" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "insert own runs" ON "public"."runs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "owner can read own usage" ON "public"."sim_usage_logs" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "read own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "read own runs" ON "public"."runs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "read own subscription" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "read_own_profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."runs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "runs_insert_any" ON "public"."runs" FOR INSERT WITH CHECK (true);



CREATE POLICY "runs_select_own" ON "public"."runs" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "service role inserts" ON "public"."sim_usage_logs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "service role update stripe_customers" ON "public"."stripe_customers" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role update subs" ON "public"."subscriptions" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role upsert stripe_customers" ON "public"."stripe_customers" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role upsert subs" ON "public"."subscriptions" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."sim_usage_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions_select_own" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "svc_upd_cnt" ON "public"."usage_counters" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (true);



CREATE POLICY "svc_upd_cnt_d" ON "public"."usage_counters_daily" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (true);



CREATE POLICY "svc_upd_ev" ON "public"."usage_events" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (true);



CREATE POLICY "svc_upd_ev_d" ON "public"."usage_events_daily" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (true);



ALTER TABLE "public"."usage_counters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_counters_daily" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_events_daily" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."community_posts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."community_posts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."community_posts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reserve_free_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reserve_free_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reserve_free_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reserve_free_quota"("p_kind" "text", "p_user_id" "uuid", "p_anon_id" "text", "p_daily_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."reserve_free_quota"("p_kind" "text", "p_user_id" "uuid", "p_anon_id" "text", "p_daily_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."reserve_free_quota"("p_kind" "text", "p_user_id" "uuid", "p_anon_id" "text", "p_daily_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."reserve_guest_quota"("p_guest" "text", "p_limit" integer, "p_tz" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reserve_guest_quota"("p_guest" "text", "p_limit" integer, "p_tz" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reserve_guest_quota"("p_guest" "text", "p_limit" integer, "p_tz" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reserve_quota_v2"("p_subject" "text", "p_idem" "text", "p_limit" integer, "p_tz" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reserve_quota_v2"("p_subject" "text", "p_idem" "text", "p_limit" integer, "p_tz" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reserve_quota_v2"("p_subject" "text", "p_idem" "text", "p_limit" integer, "p_tz" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."reserve_starter_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."reserve_starter_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reserve_starter_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reserve_starter_quota"("p_idem" "text", "p_limit" integer, "p_tz" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."subscriptions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."subscriptions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."subscriptions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."community_posts" TO "anon";
GRANT ALL ON TABLE "public"."community_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."community_posts" TO "service_role";



GRANT ALL ON TABLE "public"."community_replies" TO "anon";
GRANT ALL ON TABLE "public"."community_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."community_replies" TO "service_role";



GRANT ALL ON TABLE "public"."flow_states" TO "anon";
GRANT ALL ON TABLE "public"."flow_states" TO "authenticated";
GRANT ALL ON TABLE "public"."flow_states" TO "service_role";



GRANT ALL ON TABLE "public"."guest_quotas" TO "anon";
GRANT ALL ON TABLE "public"."guest_quotas" TO "authenticated";
GRANT ALL ON TABLE "public"."guest_quotas" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."run_quota_daily" TO "anon";
GRANT ALL ON TABLE "public"."run_quota_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."run_quota_daily" TO "service_role";



GRANT ALL ON TABLE "public"."runs" TO "anon";
GRANT ALL ON TABLE "public"."runs" TO "authenticated";
GRANT ALL ON TABLE "public"."runs" TO "service_role";



GRANT ALL ON TABLE "public"."shares" TO "anon";
GRANT ALL ON TABLE "public"."shares" TO "authenticated";
GRANT ALL ON TABLE "public"."shares" TO "service_role";



GRANT ALL ON SEQUENCE "public"."shares_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shares_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shares_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sim_usage_logs" TO "anon";
GRANT ALL ON TABLE "public"."sim_usage_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."sim_usage_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sim_usage_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sim_usage_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sim_usage_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_customers" TO "anon";
GRANT ALL ON TABLE "public"."stripe_customers" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_customers" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."usage_counters" TO "anon";
GRANT ALL ON TABLE "public"."usage_counters" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_counters" TO "service_role";



GRANT ALL ON TABLE "public"."usage_counters_daily" TO "anon";
GRANT ALL ON TABLE "public"."usage_counters_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_counters_daily" TO "service_role";



GRANT ALL ON TABLE "public"."usage_events" TO "anon";
GRANT ALL ON TABLE "public"."usage_events" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_events" TO "service_role";



GRANT ALL ON TABLE "public"."usage_events_daily" TO "anon";
GRANT ALL ON TABLE "public"."usage_events_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_events_daily" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usage_events_daily_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usage_events_daily_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usage_events_daily_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usage_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usage_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usage_events_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























