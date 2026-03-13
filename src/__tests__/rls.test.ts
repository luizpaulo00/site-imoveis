import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const schemaPath = path.resolve(__dirname, '../../supabase/schema.sql')
const schema = fs.readFileSync(schemaPath, 'utf-8')

// Extract all table names from CREATE TABLE statements
function extractTableNames(sql: string): string[] {
  const regex = /CREATE\s+TABLE\s+(?:public\.)?(\w+)/gi
  const tables: string[] = []
  let match
  while ((match = regex.exec(sql)) !== null) {
    tables.push(match[1])
  }
  return tables
}

// Check if a table has RLS enabled
function hasRlsEnabled(sql: string, tableName: string): boolean {
  const regex = new RegExp(
    `ALTER\\s+TABLE\\s+(?:public\\.)?${tableName}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
    'i'
  )
  return regex.test(sql)
}

// Check if a table has at least one policy
function hasPolicy(sql: string, tableName: string): boolean {
  const regex = new RegExp(
    `CREATE\\s+POLICY\\s+.+?\\s+ON\\s+(?:public\\.)?${tableName}`,
    'i'
  )
  return regex.test(sql)
}

describe('RLS coverage in schema.sql', () => {
  const tables = extractTableNames(schema)

  it('schema defines the expected tables', () => {
    expect(tables).toContain('site_settings')
    expect(tables).toContain('keep_alive')
    expect(tables).toContain('properties')
    expect(tables).toContain('property_images')
  })

  it('every table has ENABLE ROW LEVEL SECURITY', () => {
    for (const table of tables) {
      expect(
        hasRlsEnabled(schema, table),
        `Table "${table}" is missing ENABLE ROW LEVEL SECURITY`
      ).toBe(true)
    }
  })

  it('every table with RLS has at least one policy', () => {
    for (const table of tables) {
      expect(
        hasPolicy(schema, table),
        `Table "${table}" has RLS enabled but no CREATE POLICY`
      ).toBe(true)
    }
  })

  it('no table is created without RLS', () => {
    const tablesWithoutRls = tables.filter(
      (table) => !hasRlsEnabled(schema, table)
    )
    expect(
      tablesWithoutRls,
      `Tables without RLS: ${tablesWithoutRls.join(', ')}`
    ).toHaveLength(0)
  })
})
