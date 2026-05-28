import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pageInfo } from '../src/lib/pageInfo.ts'

const pages = ['login', 'dashboard', 'projects', 'subassemblies', 'planning', 'blockages', 'pdca', 'dailyFlow', 'kpi', 'admin']

test('every supported page has useful help text in both languages', () => {
  for (const lang of ['ro', 'en']) {
    for (const page of pages) {
      const info = pageInfo(lang, page)
      assert.equal(info.length >= 3, true, `${lang}.${page} should explain the page in at least 3 points`)
      assert.equal(info.every(item => item.length > 30), true, `${lang}.${page} should use descriptive help text`)
    }
  }
})
