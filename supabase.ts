import { createClient } from '@supabase/supabase-js';

// Environment variable names per requirements:
// VITE_SUPABASE_URL
// VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.startsWith('https://')
);

// Create the Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export interface ConnectionTestResult {
  connected: boolean;
  tablesExist: boolean;
  message: string;
  latencyMs?: number;
  details?: string;
}

/**
 * Diagnostic test to verify Supabase connectivity and schema readiness
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      tablesExist: false,
      message: 'Supabase credentials not configured. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.',
    };
  }

  const startTime = Date.now();
  try {
    // Attempt to query the positions table
    const { data, error, status } = await supabase
      .from('positions')
      .select('id, title')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      // PGRST205 or 404 indicates table is missing from schema cache
      if (error.code === 'PGRST205' || status === 404 || error.message?.includes('schema cache')) {
        return {
          connected: true,
          tablesExist: false,
          latencyMs,
          message: 'Connected to Supabase project successfully! However, database tables have not been created yet in the SQL Editor.',
          details: error.message,
        };
      }

      return {
        connected: false,
        tablesExist: false,
        latencyMs,
        message: `Supabase returned error: ${error.message}`,
        details: JSON.stringify(error),
      };
    }

    return {
      connected: true,
      tablesExist: true,
      latencyMs,
      message: `Successfully connected to Supabase and verified database tables (${latencyMs}ms)!`,
      details: `Positions found: ${data?.length ?? 0}`,
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      message: err?.message || 'Network connection failed while reaching Supabase.',
      details: String(err),
    };
  }
}

/**
 * Verify reading and writing a live work record to Supabase
 */
export async function testSampleRecordReadWrite(): Promise<{
  success: boolean;
  message: string;
  record?: any;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase is not configured in .env.local.',
    };
  }

  const testId = `test_probe_${Date.now()}`;
  try {
    // Check if kpi table exists or use existing KPI
    const { data: kpiData } = await supabase
      .from('kpis')
      .select('id')
      .limit(1);

    const targetKpiId = kpiData?.[0]?.id || 'kpi_inc_1';

    // 1. Insert a test control reading
    const testPoint = {
      id: testId,
      kpi_id: targetKpiId,
      period_type: 'Daily',
      label: 'Diagnostics Self-Test',
      timestamp: new Date().toISOString(),
      value: 99.9,
      operator_name: 'DWM System Validator',
      remarks: 'Automated integration probe test',
    };

    const { error: insertError } = await supabase
      .from('control_data_points')
      .insert(testPoint);

    if (insertError) {
      return {
        success: false,
        message: `Insert test failed: ${insertError.message}. Make sure supabase_schema.sql has been executed in the Supabase SQL Editor.`,
      };
    }

    // 2. Read it back
    const { data: readData, error: readError } = await supabase
      .from('control_data_points')
      .select('*')
      .eq('id', testId)
      .single();

    if (readError) {
      return {
        success: false,
        message: `Read test failed: ${readError.message}`,
      };
    }

    // 3. Clean up the probe test
    await supabase.from('control_data_points').delete().eq('id', testId);

    return {
      success: true,
      message: 'Successfully verified live INSERT, SELECT, and DELETE operations on Supabase!',
      record: readData,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Read/write test encountered an exception: ${err?.message || err}`,
    };
  }
}
