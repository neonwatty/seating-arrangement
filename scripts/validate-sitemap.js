#!/usr/bin/env node

/**
 * Sitemap Validation Script
 *
 * Validates that all URLs in sitemap.xml correspond to valid routes
 * defined in the application router.
 *
 * Usage: node scripts/validate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define valid static routes (routes without dynamic parameters)
// These should match the routes in src/router/index.tsx
const VALID_ROUTES = [
  '/',
  '/events',
  '/wedding-seating',
  '/corporate-events',
  '/gala-seating',
  '/team-offsite',
  '/private-party',
  '/how-it-works',
  // Dynamic routes like /events/:eventId/*, /table/:encodedData, /share/:encodedData
  // should NOT be in sitemap as they require runtime data
];

// Expected domain
const EXPECTED_DOMAIN = 'https://seatify.app';

function extractUrlsFromSitemap(sitemapPath) {
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const urlMatches = content.match(/<loc>([^<]+)<\/loc>/g) || [];
  return urlMatches.map(match => {
    const url = match.replace(/<\/?loc>/g, '');
    return url;
  });
}

function validateSitemap() {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found at public/sitemap.xml');
    process.exit(1);
  }

  console.log('🔍 Validating sitemap.xml...\n');

  const urls = extractUrlsFromSitemap(sitemapPath);

  if (urls.length === 0) {
    console.error('❌ No URLs found in sitemap.xml');
    process.exit(1);
  }

  console.log(`Found ${urls.length} URL(s) in sitemap:\n`);

  let hasErrors = false;
  const errors = [];
  const warnings = [];

  for (const url of urls) {
    // Check domain
    if (!url.startsWith(EXPECTED_DOMAIN)) {
      errors.push(`❌ ${url} - Invalid domain (expected ${EXPECTED_DOMAIN})`);
      hasErrors = true;
      continue;
    }

    // Extract path from URL
    const urlPath = url.replace(EXPECTED_DOMAIN, '') || '/';

    // Check if path is a valid static route
    if (VALID_ROUTES.includes(urlPath)) {
      console.log(`✅ ${url}`);
    } else {
      // Check if it might be a dynamic route pattern
      if (urlPath.includes(':') || urlPath.match(/\/[a-zA-Z0-9]{10,}/)) {
        errors.push(`❌ ${url} - Dynamic routes should not be in sitemap`);
        hasErrors = true;
      } else {
        errors.push(`❌ ${url} - Route "${urlPath}" not found in VALID_ROUTES`);
        hasErrors = true;
      }
    }
  }

  // Check for missing routes
  for (const route of VALID_ROUTES) {
    const expectedUrl = `${EXPECTED_DOMAIN}${route}`;
    if (!urls.includes(expectedUrl)) {
      warnings.push(`⚠️  Missing route in sitemap: ${expectedUrl}`);
    }
  }

  console.log('');

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(w => console.log(w));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log(e));
    console.log('');
    console.log('❌ Sitemap validation failed!');
    console.log('\nTo fix:');
    console.log('1. Update public/sitemap.xml to only include valid static routes');
    console.log('2. If you added a new page, add the route to VALID_ROUTES in this script');
    process.exit(1);
  }

  console.log('✅ Sitemap validation passed!');
  process.exit(0);
}

validateSitemap();
