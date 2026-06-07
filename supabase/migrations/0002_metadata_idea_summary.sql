-- Migration: 0002_metadata_idea_summary
-- Add idea_summary field to piece_metadata

alter table public.piece_metadata add column idea_summary text;
