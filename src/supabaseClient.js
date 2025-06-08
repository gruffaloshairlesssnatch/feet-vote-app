import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ftqahtiefrzwponararu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cWFodGllZnJ6d3BvbmFyYXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODI1MDcsImV4cCI6MjA2NDk1ODUwN30.NsuYeULUYNm1vp_XwEZQUagXw_OJkhVShpibx-pGsIk'

export const supabase = createClient(supabaseUrl, supabaseKey)
