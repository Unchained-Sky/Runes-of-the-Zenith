


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


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."archetype" AS ENUM (
    'ARCANE',
    'ELEMENTAL',
    'MONK',
    'ROGUE',
    'WAR_CHIEF',
    'GUARDIAN',
    'PSYCHIC',
    'WARLOCK',
    'CELESTIAL',
    'NATURE',
    'WEAPONS_MASTER',
    'BEAST_MASTER',
    'DEMONIC',
    'GENERIC'
);


ALTER TYPE "public"."archetype" OWNER TO "postgres";


CREATE TYPE "public"."character_type" AS ENUM (
    'HERO',
    'ENEMY'
);


ALTER TYPE "public"."character_type" OWNER TO "postgres";


CREATE TYPE "public"."damage_type" AS ENUM (
    'INTELLIGENCE',
    'DEXTERITY',
    'STRENGTH',
    'CHARISMA',
    'WILLPOWER',
    'FEROCITY',
    'OMNI'
);


ALTER TYPE "public"."damage_type" OWNER TO "postgres";


CREATE TYPE "public"."decrement_time" AS ENUM (
    'CUSTOM',
    'START_ROUND',
    'END_ROUND',
    'START_TURN',
    'END_TURN'
);


ALTER TYPE "public"."decrement_time" OWNER TO "postgres";


CREATE TYPE "public"."map_terrain_type" AS ENUM (
    'BLOCKED',
    'NORMAL',
    'ROUGH',
    'HARSH',
    'GAP'
);


ALTER TYPE "public"."map_terrain_type" OWNER TO "postgres";


CREATE TYPE "public"."map_type" AS ENUM (
    'COMBAT',
    'OVERWORLD'
);


ALTER TYPE "public"."map_type" OWNER TO "postgres";


CREATE TYPE "public"."rune_durability" AS ENUM (
    'REINFORCED',
    'STABLE',
    'UNSTABLE',
    'FRAGILE',
    'BROKEN'
);


ALTER TYPE "public"."rune_durability" OWNER TO "postgres";


CREATE TYPE "public"."rune_slot" AS ENUM (
    'PRIMARY',
    'SECONDARY',
    'PASSIVE'
);


ALTER TYPE "public"."rune_slot" OWNER TO "postgres";


CREATE TYPE "public"."subarchetype" AS ENUM (
    'ASTRAL',
    'CONSTRUCTS',
    'SORCERY',
    'FIRE',
    'WATER',
    'WIND',
    'EARTH',
    'ELECTRIC',
    'UNARMED',
    'DODGE',
    'BREWMASTER',
    'STEALTH',
    'TOXINS',
    'ASSAILABLE',
    'BATTLE_CRY',
    'BLOODTHIRST',
    'ARMOUR',
    'VIGOUR',
    'INSPIRE',
    'TRICKERY',
    'HELLFIRE',
    'DEMONOLOGY',
    'BLOOD_PACT',
    'HOLY',
    'UNHOLY',
    'PLANT',
    'SHAPESHIFT',
    'THORNS',
    'BOW',
    'SHORT_SWORD',
    'AXE',
    'BULWARK',
    'GREAT_SWORD',
    'DAGGERS',
    'CHAINS',
    'WHIPS',
    'TERRESTRIAL',
    'AERIAL',
    'AQUATIC',
    'DEMONIC',
    'GENERIC',
    'BASE'
);


ALTER TYPE "public"."subarchetype" OWNER TO "postgres";


CREATE TYPE "public"."token_alignment" AS ENUM (
    'POSITIVE',
    'NEUTRAL',
    'NEGATIVE'
);


ALTER TYPE "public"."token_alignment" OWNER TO "postgres";


CREATE TYPE "public"."turn_type" AS ENUM (
    'PRIMARY',
    'SECONDARY'
);


ALTER TYPE "public"."turn_type" OWNER TO "postgres";


CREATE TYPE "public"."visibility" AS ENUM (
    'PUBLIC',
    'PRIVATE'
);


ALTER TYPE "public"."visibility" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."campaign_info" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "campaign_id" integer NOT NULL,
    "campaign_name" "text" NOT NULL,
    "invite_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."campaign_info" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaign_info" IS 'Campaign Info';



ALTER TABLE "public"."campaign_info" ALTER COLUMN "campaign_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."campaign_owner_campaign_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."campaign_users" (
    "user_id" "uuid" NOT NULL,
    "campaign_id" integer NOT NULL,
    "id_hash" "text" NOT NULL
);


ALTER TABLE "public"."campaign_users" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaign_users" IS 'Campaign Users';



COMMENT ON COLUMN "public"."campaign_users"."id_hash" IS 'md5({campaign_id}_{user_id})';



CREATE TABLE IF NOT EXISTS "public"."character_info" (
    "character_id" integer NOT NULL,
    "character_type" "public"."character_type" NOT NULL,
    "max_health" smallint NOT NULL,
    "max_shield" smallint NOT NULL,
    "int" smallint NOT NULL,
    "str" smallint NOT NULL,
    "dex" smallint NOT NULL,
    "max_movement" smallint NOT NULL,
    "crit_chance" smallint NOT NULL,
    "int_def" smallint NOT NULL,
    "str_def" smallint NOT NULL,
    "dex_def" smallint NOT NULL
);


ALTER TABLE "public"."character_info" OWNER TO "postgres";


ALTER TABLE "public"."character_info" ALTER COLUMN "character_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."character_info_character_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."hero_info" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "hero_name" "text" NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "hero_id" integer NOT NULL,
    "campaign_id" integer,
    "visibility" "public"."visibility" DEFAULT 'PRIVATE'::"public"."visibility" NOT NULL,
    "character_id" integer NOT NULL
);


ALTER TABLE "public"."hero_info" OWNER TO "postgres";


COMMENT ON TABLE "public"."hero_info" IS 'Hero Info';



ALTER TABLE "public"."hero_info" ALTER COLUMN "hero_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."characters_character_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."compendium_encounter" (
    "encounter_hash" "text" NOT NULL,
    "encounter_id" bigint NOT NULL,
    "encounter_source" "text" NOT NULL
);


ALTER TABLE "public"."compendium_encounter" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compendium_enemy" (
    "enemy_hash" "text" NOT NULL,
    "enemy_id" integer,
    "enemy_source" "text"
);


ALTER TABLE "public"."compendium_enemy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compendium_map" (
    "map_hash" "text" NOT NULL,
    "map_id" bigint NOT NULL,
    "map_source" "text" NOT NULL
);


ALTER TABLE "public"."compendium_map" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."encounter_info" (
    "encounter_id" bigint NOT NULL,
    "encounter_name" "text" NOT NULL,
    "map_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."encounter_info" OWNER TO "postgres";


ALTER TABLE "public"."encounter_info" ALTER COLUMN "encounter_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."encounter_info_encounter_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."encounter_tile" (
    "encounter_id" bigint NOT NULL,
    "q" integer NOT NULL,
    "r" integer NOT NULL,
    "s" integer NOT NULL,
    "enemy_id" integer
);


ALTER TABLE "public"."encounter_tile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enemy_info" (
    "enemy_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enemy_name" "text" NOT NULL,
    "character_id" integer NOT NULL,
    "aggression" smallint NOT NULL
);


ALTER TABLE "public"."enemy_info" OWNER TO "postgres";


ALTER TABLE "public"."enemy_info" ALTER COLUMN "enemy_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."enemy_info_enemy_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."enemy_rune_info" (
    "enemy_id" integer NOT NULL,
    "rune_name" "text" NOT NULL,
    "slot" "public"."rune_slot" NOT NULL,
    "data" "jsonb" NOT NULL,
    "durability" "public"."rune_durability" NOT NULL,
    "damage_type" "public"."damage_type" NOT NULL
);


ALTER TABLE "public"."enemy_rune_info" OWNER TO "postgres";


ALTER TABLE "public"."enemy_rune_info" ALTER COLUMN "enemy_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."enemy_rune_info_enemy_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."hero_rune" (
    "hero_id" integer NOT NULL,
    "rune_name" "text" NOT NULL
);


ALTER TABLE "public"."hero_rune" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."map_combat_tile" (
    "map_id" bigint NOT NULL,
    "q" integer NOT NULL,
    "r" integer NOT NULL,
    "s" integer NOT NULL,
    "image" "text" DEFAULT 'grass'::"text" NOT NULL,
    "terrain_type" "public"."map_terrain_type" DEFAULT 'NORMAL'::"public"."map_terrain_type" NOT NULL
);


ALTER TABLE "public"."map_combat_tile" OWNER TO "postgres";


COMMENT ON TABLE "public"."map_combat_tile" IS 'Combat Map Tiles';



CREATE TABLE IF NOT EXISTS "public"."map_info" (
    "map_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "map_name" "text" DEFAULT 'New Map'::"text" NOT NULL,
    "map_type" "public"."map_type" NOT NULL
);


ALTER TABLE "public"."map_info" OWNER TO "postgres";


COMMENT ON TABLE "public"."map_info" IS 'Map Info';



ALTER TABLE "public"."map_info" ALTER COLUMN "map_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."map_info_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."map_combat_tile" ALTER COLUMN "map_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."map_tile_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."rune_archetypes" (
    "damage_type" "public"."damage_type" NOT NULL,
    "archetype" "public"."archetype" NOT NULL,
    "subarchetype" "public"."subarchetype" NOT NULL
);


ALTER TABLE "public"."rune_archetypes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rune_info" (
    "rune_name" "text" NOT NULL,
    "slot" "public"."rune_slot" NOT NULL,
    "durability" "public"."rune_durability" NOT NULL,
    "data" "jsonb" NOT NULL,
    "subarchetype" "public"."subarchetype" NOT NULL
);


ALTER TABLE "public"."rune_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skill_info" (
    "skill_id" "text" NOT NULL,
    "version" "text" NOT NULL,
    "skill_data" "jsonb" NOT NULL,
    "hash" "text" NOT NULL
);


ALTER TABLE "public"."skill_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skill_links" (
    "skill_id" "text" NOT NULL,
    "next_skill_id" "text" NOT NULL,
    "version" "text" NOT NULL,
    "hash" "text" NOT NULL
);


ALTER TABLE "public"."skill_links" OWNER TO "postgres";


COMMENT ON COLUMN "public"."skill_links"."hash" IS 'skill_id-next_skill_id-version';



CREATE TABLE IF NOT EXISTS "public"."tabletop_character_token" (
    "tt_character_id" integer NOT NULL,
    "token_name" "text" DEFAULT ''::"text" NOT NULL,
    "amount" smallint NOT NULL
);


ALTER TABLE "public"."tabletop_character_token" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tabletop_characters" (
    "tt_character_id" integer NOT NULL,
    "character_type" "public"."character_type" NOT NULL,
    "campaign_id" integer NOT NULL,
    "health" smallint NOT NULL,
    "wounds" smallint DEFAULT '0'::smallint NOT NULL,
    "shield" smallint NOT NULL,
    "trauma" smallint DEFAULT '0'::smallint NOT NULL,
    "movement" smallint DEFAULT '0'::smallint NOT NULL
);


ALTER TABLE "public"."tabletop_characters" OWNER TO "postgres";


ALTER TABLE "public"."tabletop_characters" ALTER COLUMN "tt_character_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tabletop_characters_character_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tabletop_enemy" (
    "enemy_id" integer NOT NULL,
    "tt_character_id" integer NOT NULL,
    "current_aggression" smallint NOT NULL,
    "used_primary" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."tabletop_enemy" OWNER TO "postgres";


ALTER TABLE "public"."tabletop_enemy" ALTER COLUMN "enemy_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tabletop_enemy_enemy_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tabletop_hero_turn" (
    "tt_character_id" integer NOT NULL,
    "turn_type" "public"."turn_type" NOT NULL,
    "used" boolean NOT NULL,
    "order" smallint,
    CONSTRAINT "tabletop_hero_turn_order_check" CHECK (("order" > 0))
);


ALTER TABLE "public"."tabletop_hero_turn" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tabletop_heroes" (
    "hero_id" integer NOT NULL,
    "tt_character_id" integer NOT NULL
);


ALTER TABLE "public"."tabletop_heroes" OWNER TO "postgres";


ALTER TABLE "public"."tabletop_heroes" ALTER COLUMN "hero_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tabletop_heroes_hero_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tabletop_info" (
    "campaign_id" integer NOT NULL,
    "encounter_id" bigint,
    "round" smallint DEFAULT '1'::smallint NOT NULL
);


ALTER TABLE "public"."tabletop_info" OWNER TO "postgres";


ALTER TABLE "public"."tabletop_info" ALTER COLUMN "campaign_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tabletop_info_campaign_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tabletop_lingering" (
    "tt_character_id" integer NOT NULL,
    "decrement_time" "public"."decrement_time" DEFAULT 'CUSTOM'::"public"."decrement_time" NOT NULL,
    "remaining_time" smallint NOT NULL,
    "data" "jsonb" NOT NULL,
    "linger_id" bigint NOT NULL
);


ALTER TABLE "public"."tabletop_lingering" OWNER TO "postgres";


ALTER TABLE "public"."tabletop_lingering" ALTER COLUMN "linger_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tabletop_lingering_linger_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tabletop_rune_state" (
    "tt_character_id" integer NOT NULL,
    "rune_name" "text" NOT NULL,
    "rune_state" "public"."rune_durability" NOT NULL
);


ALTER TABLE "public"."tabletop_rune_state" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tabletop_tiles" (
    "q" integer NOT NULL,
    "r" integer NOT NULL,
    "s" integer NOT NULL,
    "tt_character_id" integer,
    "campaign_id" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."tabletop_tiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_info" (
    "name" "text" NOT NULL,
    "alignment" "public"."token_alignment" NOT NULL,
    "extraData" "jsonb" NOT NULL
);


ALTER TABLE "public"."token_info" OWNER TO "postgres";


ALTER TABLE ONLY "public"."campaign_info"
    ADD CONSTRAINT "campaign_info_invite_id_key" UNIQUE ("invite_id");



ALTER TABLE ONLY "public"."campaign_info"
    ADD CONSTRAINT "campaign_info_pkey" PRIMARY KEY ("campaign_id");



ALTER TABLE ONLY "public"."campaign_users"
    ADD CONSTRAINT "campaign_members_id_hash_key" UNIQUE ("id_hash");



ALTER TABLE ONLY "public"."campaign_info"
    ADD CONSTRAINT "campaign_owner_campaign_id_key" UNIQUE ("campaign_id");



ALTER TABLE ONLY "public"."campaign_users"
    ADD CONSTRAINT "campaign_users_pkey" PRIMARY KEY ("user_id", "campaign_id");



ALTER TABLE ONLY "public"."character_info"
    ADD CONSTRAINT "character_info_character_id_key" UNIQUE ("character_id");



ALTER TABLE ONLY "public"."hero_info"
    ADD CONSTRAINT "character_info_pkey" PRIMARY KEY ("hero_id");



ALTER TABLE ONLY "public"."character_info"
    ADD CONSTRAINT "character_info_pkey1" PRIMARY KEY ("character_id");



ALTER TABLE ONLY "public"."hero_info"
    ADD CONSTRAINT "characters_character_id_key" UNIQUE ("hero_id");



ALTER TABLE ONLY "public"."compendium_encounter"
    ADD CONSTRAINT "compendium_encounter_pkey" PRIMARY KEY ("encounter_hash");



ALTER TABLE ONLY "public"."compendium_enemy"
    ADD CONSTRAINT "compendium_enemy_pkey" PRIMARY KEY ("enemy_hash");



ALTER TABLE ONLY "public"."compendium_map"
    ADD CONSTRAINT "compendium_map_pkey" PRIMARY KEY ("map_hash");



ALTER TABLE ONLY "public"."encounter_info"
    ADD CONSTRAINT "encounter_info_encounter_id_key" UNIQUE ("encounter_id");



ALTER TABLE ONLY "public"."encounter_info"
    ADD CONSTRAINT "encounter_info_pkey" PRIMARY KEY ("encounter_id");



ALTER TABLE ONLY "public"."encounter_tile"
    ADD CONSTRAINT "encounter_tile_pkey" PRIMARY KEY ("encounter_id", "q", "r", "s");



ALTER TABLE ONLY "public"."enemy_info"
    ADD CONSTRAINT "enemy_info_enemy_id_key" UNIQUE ("enemy_id");



ALTER TABLE ONLY "public"."enemy_info"
    ADD CONSTRAINT "enemy_info_pkey" PRIMARY KEY ("enemy_id");



ALTER TABLE ONLY "public"."enemy_rune_info"
    ADD CONSTRAINT "enemy_rune_info_pkey1" PRIMARY KEY ("enemy_id", "rune_name");



ALTER TABLE ONLY "public"."hero_rune"
    ADD CONSTRAINT "hero_rune_pkey" PRIMARY KEY ("hero_id", "rune_name");



ALTER TABLE ONLY "public"."map_info"
    ADD CONSTRAINT "map_info_pkey" PRIMARY KEY ("map_id");



ALTER TABLE ONLY "public"."map_combat_tile"
    ADD CONSTRAINT "map_tile_pkey" PRIMARY KEY ("map_id", "q", "r", "s");



ALTER TABLE ONLY "public"."rune_archetypes"
    ADD CONSTRAINT "rune_archetypes_pkey" PRIMARY KEY ("subarchetype");



ALTER TABLE ONLY "public"."rune_info"
    ADD CONSTRAINT "rune_info_pkey" PRIMARY KEY ("rune_name");



ALTER TABLE ONLY "public"."skill_info"
    ADD CONSTRAINT "skill_info_hash_key" UNIQUE ("hash");



ALTER TABLE ONLY "public"."skill_info"
    ADD CONSTRAINT "skill_info_pkey" PRIMARY KEY ("hash");



ALTER TABLE ONLY "public"."skill_links"
    ADD CONSTRAINT "skill_links_combo_key" UNIQUE ("hash");



ALTER TABLE ONLY "public"."skill_links"
    ADD CONSTRAINT "skill_links_pkey" PRIMARY KEY ("hash");



ALTER TABLE ONLY "public"."tabletop_character_token"
    ADD CONSTRAINT "tabletop_character_token_pkey" PRIMARY KEY ("tt_character_id", "token_name");



ALTER TABLE ONLY "public"."tabletop_characters"
    ADD CONSTRAINT "tabletop_characters_character_id_key" UNIQUE ("tt_character_id");



ALTER TABLE ONLY "public"."tabletop_characters"
    ADD CONSTRAINT "tabletop_characters_pkey" PRIMARY KEY ("tt_character_id", "character_type");



ALTER TABLE ONLY "public"."tabletop_enemy"
    ADD CONSTRAINT "tabletop_enemy_pkey" PRIMARY KEY ("tt_character_id");



ALTER TABLE ONLY "public"."tabletop_hero_turn"
    ADD CONSTRAINT "tabletop_hero_turn_pkey" PRIMARY KEY ("tt_character_id", "turn_type");



ALTER TABLE ONLY "public"."tabletop_heroes"
    ADD CONSTRAINT "tabletop_heroes_pkey" PRIMARY KEY ("hero_id");



ALTER TABLE ONLY "public"."tabletop_info"
    ADD CONSTRAINT "tabletop_info_pkey" PRIMARY KEY ("campaign_id");



ALTER TABLE ONLY "public"."tabletop_lingering"
    ADD CONSTRAINT "tabletop_lingering_pkey" PRIMARY KEY ("tt_character_id", "linger_id");



ALTER TABLE ONLY "public"."tabletop_rune_state"
    ADD CONSTRAINT "tabletop_rune_state_pkey" PRIMARY KEY ("tt_character_id", "rune_name");



ALTER TABLE ONLY "public"."tabletop_tiles"
    ADD CONSTRAINT "tabletop_tiles_pkey" PRIMARY KEY ("r", "s", "campaign_id", "q");



ALTER TABLE ONLY "public"."token_info"
    ADD CONSTRAINT "token_pkey" PRIMARY KEY ("name");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."hero_info" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('last_updated');



ALTER TABLE ONLY "public"."campaign_users"
    ADD CONSTRAINT "campaign_members_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign_info"("campaign_id");



ALTER TABLE ONLY "public"."campaign_users"
    ADD CONSTRAINT "campaign_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."campaign_info"
    ADD CONSTRAINT "campaign_owner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."hero_info"
    ADD CONSTRAINT "characters_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign_info"("campaign_id");



ALTER TABLE ONLY "public"."hero_info"
    ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compendium_encounter"
    ADD CONSTRAINT "compendium_encounter_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounter_info"("encounter_id");



ALTER TABLE ONLY "public"."compendium_enemy"
    ADD CONSTRAINT "compendium_enemy_enemy_id_fkey" FOREIGN KEY ("enemy_id") REFERENCES "public"."enemy_info"("enemy_id");



ALTER TABLE ONLY "public"."compendium_map"
    ADD CONSTRAINT "compendium_map_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "public"."map_info"("map_id");



ALTER TABLE ONLY "public"."encounter_info"
    ADD CONSTRAINT "encounter_info_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "public"."map_info"("map_id");



ALTER TABLE ONLY "public"."encounter_info"
    ADD CONSTRAINT "encounter_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."encounter_tile"
    ADD CONSTRAINT "encounter_tile_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounter_info"("encounter_id");



ALTER TABLE ONLY "public"."encounter_tile"
    ADD CONSTRAINT "encounter_tile_enemy_id_fkey" FOREIGN KEY ("enemy_id") REFERENCES "public"."enemy_info"("enemy_id");



ALTER TABLE ONLY "public"."enemy_info"
    ADD CONSTRAINT "enemy_info_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."character_info"("character_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enemy_info"
    ADD CONSTRAINT "enemy_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."enemy_rune_info"
    ADD CONSTRAINT "enemy_rune_info_enemy_id_fkey" FOREIGN KEY ("enemy_id") REFERENCES "public"."enemy_info"("enemy_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hero_info"
    ADD CONSTRAINT "hero_info_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."character_info"("character_id");



ALTER TABLE ONLY "public"."hero_rune"
    ADD CONSTRAINT "hero_rune_hero_id_fkey" FOREIGN KEY ("hero_id") REFERENCES "public"."hero_info"("hero_id");



ALTER TABLE ONLY "public"."hero_rune"
    ADD CONSTRAINT "hero_rune_rune_name_fkey" FOREIGN KEY ("rune_name") REFERENCES "public"."rune_info"("rune_name");



ALTER TABLE ONLY "public"."map_combat_tile"
    ADD CONSTRAINT "map_combat_tile_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "public"."map_info"("map_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."map_info"
    ADD CONSTRAINT "map_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tabletop_character_token"
    ADD CONSTRAINT "tabletop_character_token_token_name_fkey" FOREIGN KEY ("token_name") REFERENCES "public"."token_info"("name");



ALTER TABLE ONLY "public"."tabletop_character_token"
    ADD CONSTRAINT "tabletop_character_token_tt_character_id_fkey" FOREIGN KEY ("tt_character_id") REFERENCES "public"."tabletop_characters"("tt_character_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tabletop_characters"
    ADD CONSTRAINT "tabletop_characters_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign_info"("campaign_id");



ALTER TABLE ONLY "public"."tabletop_enemy"
    ADD CONSTRAINT "tabletop_enemy_enemy_id_fkey" FOREIGN KEY ("enemy_id") REFERENCES "public"."enemy_info"("enemy_id");



ALTER TABLE ONLY "public"."tabletop_enemy"
    ADD CONSTRAINT "tabletop_enemy_tt_character_id_fkey" FOREIGN KEY ("tt_character_id") REFERENCES "public"."tabletop_characters"("tt_character_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tabletop_hero_turn"
    ADD CONSTRAINT "tabletop_hero_turn_tt_character_id_fkey" FOREIGN KEY ("tt_character_id") REFERENCES "public"."tabletop_characters"("tt_character_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tabletop_heroes"
    ADD CONSTRAINT "tabletop_heroes_hero_id_fkey" FOREIGN KEY ("hero_id") REFERENCES "public"."hero_info"("hero_id");



ALTER TABLE ONLY "public"."tabletop_heroes"
    ADD CONSTRAINT "tabletop_heroes_tt_character_id_fkey" FOREIGN KEY ("tt_character_id") REFERENCES "public"."tabletop_characters"("tt_character_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tabletop_info"
    ADD CONSTRAINT "tabletop_info_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign_info"("campaign_id");



ALTER TABLE ONLY "public"."tabletop_info"
    ADD CONSTRAINT "tabletop_info_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounter_info"("encounter_id");



ALTER TABLE ONLY "public"."tabletop_lingering"
    ADD CONSTRAINT "tabletop_lingering_tt_character_id_fkey" FOREIGN KEY ("tt_character_id") REFERENCES "public"."tabletop_characters"("tt_character_id");



ALTER TABLE ONLY "public"."tabletop_rune_state"
    ADD CONSTRAINT "tabletop_rune_state_tt_character_id_fkey" FOREIGN KEY ("tt_character_id") REFERENCES "public"."tabletop_characters"("tt_character_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tabletop_tiles"
    ADD CONSTRAINT "tabletop_tiles_tt_character_id_fkey" FOREIGN KEY ("tt_character_id") REFERENCES "public"."tabletop_characters"("tt_character_id") ON DELETE SET NULL;



CREATE POLICY "Enable GMs to view private characters" ON "public"."hero_info" FOR SELECT TO "authenticated" USING (("campaign_id" IN ( SELECT "campaign_info"."campaign_id"
   FROM "public"."campaign_info"
  WHERE ("campaign_info"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Enable campaign users to view private characters" ON "public"."hero_info" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaign_users"
  WHERE (("campaign_users"."user_id" = "auth"."uid"()) AND ("hero_info"."campaign_id" = "campaign_users"."campaign_id")))));



CREATE POLICY "Enable character to be public" ON "public"."hero_info" FOR SELECT USING (("visibility" = 'PUBLIC'::"public"."visibility"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."campaign_info" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."campaign_users" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."hero_info" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."map_info" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."compendium_encounter" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."compendium_enemy" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."compendium_map" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."enemy_rune_info" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."rune_archetypes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."rune_info" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."skill_info" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."skill_links" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."token_info" FOR SELECT USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."campaign_info" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."campaign_users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."encounter_info" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."enemy_info" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."hero_info" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."map_info" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Insert own maps" ON "public"."map_combat_tile" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."map_info"
  WHERE (("map_info"."map_id" = "map_combat_tile"."map_id") AND ("map_info"."user_id" = "auth"."uid"())))));



CREATE POLICY "Select compendium encounters" ON "public"."encounter_info" FOR SELECT USING (("user_id" = '00000000-0000-0000-0000-000000000000'::"uuid"));



CREATE POLICY "Select compendium encounters" ON "public"."encounter_tile" FOR SELECT USING (("encounter_id" IN ( SELECT "encounter_info"."encounter_id"
   FROM "public"."encounter_info"
  WHERE ("encounter_info"."user_id" = '00000000-0000-0000-0000-000000000000'::"uuid"))));



CREATE POLICY "Select compendium enemy" ON "public"."enemy_info" FOR SELECT USING (("user_id" = '00000000-0000-0000-0000-000000000000'::"uuid"));



CREATE POLICY "Select compendium maps" ON "public"."map_combat_tile" FOR SELECT USING (("map_id" IN ( SELECT "map_info"."map_id"
   FROM "public"."map_info"
  WHERE ("map_info"."user_id" = '00000000-0000-0000-0000-000000000000'::"uuid"))));



CREATE POLICY "Select compendium maps" ON "public"."map_info" FOR SELECT USING (("user_id" = '00000000-0000-0000-0000-000000000000'::"uuid"));



CREATE POLICY "Select if in campaign" ON "public"."campaign_info" FOR SELECT TO "authenticated" USING (("campaign_id" IN ( SELECT "campaign_users"."campaign_id"
   FROM "public"."campaign_users"
  WHERE ("campaign_users"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Select own encounter" ON "public"."encounter_tile" FOR SELECT TO "authenticated" USING (("encounter_id" IN ( SELECT "encounter_info"."encounter_id"
   FROM "public"."encounter_info"
  WHERE ("encounter_info"."user_id" = "auth"."uid"()))));



CREATE POLICY "Select own maps" ON "public"."map_combat_tile" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."map_info"
  WHERE (("map_info"."map_id" = "map_combat_tile"."map_id") AND ("map_info"."user_id" = "auth"."uid"())))));



CREATE POLICY "TEMP TRUE" ON "public"."character_info" FOR SELECT USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."hero_rune" FOR SELECT USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_character_token" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_characters" FOR SELECT USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_enemy" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_hero_turn" FOR SELECT USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_heroes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_info" FOR SELECT USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_lingering" FOR SELECT USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_rune_state" FOR SELECT USING (true);



CREATE POLICY "TEMP TRUE" ON "public"."tabletop_tiles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."campaign_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."character_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compendium_encounter" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compendium_enemy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compendium_map" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."encounter_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."encounter_tile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enemy_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enemy_rune_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hero_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hero_rune" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."map_combat_tile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."map_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rune_archetypes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rune_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skill_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skill_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_character_token" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_characters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_enemy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_hero_turn" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_heroes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_lingering" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_rune_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabletop_tiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_info" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_character_token";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_characters";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_enemy";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_hero_turn";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_heroes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_info";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_lingering";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_rune_state";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tabletop_tiles";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";
























GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."campaign_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."campaign_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."campaign_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."campaign_owner_campaign_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."campaign_owner_campaign_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."campaign_owner_campaign_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."campaign_users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."campaign_users" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."campaign_users" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."character_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."character_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."character_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."character_info_character_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."character_info_character_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."character_info_character_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hero_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hero_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hero_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."characters_character_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."characters_character_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."characters_character_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_encounter" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_encounter" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_encounter" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_enemy" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_enemy" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_enemy" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_map" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_map" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."compendium_map" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."encounter_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."encounter_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."encounter_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."encounter_info_encounter_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."encounter_info_encounter_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."encounter_info_encounter_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."encounter_tile" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."encounter_tile" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."encounter_tile" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."enemy_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."enemy_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."enemy_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."enemy_info_enemy_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."enemy_info_enemy_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."enemy_info_enemy_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."enemy_rune_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."enemy_rune_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."enemy_rune_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."enemy_rune_info_enemy_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."enemy_rune_info_enemy_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."enemy_rune_info_enemy_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hero_rune" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hero_rune" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hero_rune" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."map_combat_tile" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."map_combat_tile" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."map_combat_tile" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."map_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."map_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."map_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."map_info_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."map_info_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."map_info_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."map_tile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."map_tile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."map_tile_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rune_archetypes" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rune_archetypes" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rune_archetypes" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rune_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rune_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rune_info" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."skill_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."skill_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."skill_info" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."skill_links" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."skill_links" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."skill_links" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_character_token" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_character_token" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_character_token" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_characters" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_characters" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_characters" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tabletop_characters_character_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tabletop_characters_character_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tabletop_characters_character_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_enemy" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_enemy" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_enemy" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tabletop_enemy_enemy_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tabletop_enemy_enemy_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tabletop_enemy_enemy_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_hero_turn" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_hero_turn" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_hero_turn" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_heroes" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_heroes" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_heroes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tabletop_heroes_hero_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tabletop_heroes_hero_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tabletop_heroes_hero_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tabletop_info_campaign_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tabletop_info_campaign_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tabletop_info_campaign_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_lingering" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_lingering" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_lingering" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tabletop_lingering_linger_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tabletop_lingering_linger_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tabletop_lingering_linger_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_rune_state" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_rune_state" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_rune_state" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_tiles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_tiles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tabletop_tiles" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."token_info" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."token_info" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."token_info" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";



































