import { proxy } from '../proxy'
import { NextRequest } from 'next/server'
import { getSafeReturnUrl } from '../lib/actions/customer-auth'

async function testRedirectChain() {
  console.log('=== TESTING HOST-ROUTING & REDIRECT-CHAIN SERVER-SIDE ===\n')

  // Test 1: Unauthenticated request to access.lubbalmandumah.com/id/login
  console.log('📌 TEST 1: Requesting /id/login on access.lubbalmandumah.com')
  const req1 = new NextRequest('https://access.lubbalmandumah.com/id/login?redirect_to=/portal', {
    headers: { host: 'access.lubbalmandumah.com' }
  })
  const res1 = await proxy(req1)
  const loc1 = res1.headers.get('location')
  console.log(`   Response Status: ${res1.status}`)
  console.log(`   Redirect Location: ${loc1}`)
  if (res1.status === 307 && loc1 === 'https://id.lubbalmandumah.com/id/login?redirect_to=/portal') {
    console.log('✅ TEST 1 PASSED: Intercepted /id/login on access host and redirected across hosts to id.lubbalmandumah.com!\n')
  } else {
    throw new Error(`TEST 1 FAILED: Expected 307 redirect to id.lubbalmandumah.com, got status ${res1.status} and location ${loc1}`)
  }

  // Test 2: Requesting root / on access.lubbalmandumah.com
  console.log('📌 TEST 2: Requesting root / on access.lubbalmandumah.com')
  const req2 = new NextRequest('https://access.lubbalmandumah.com/', {
    headers: { host: 'access.lubbalmandumah.com' }
  })
  const res2 = await proxy(req2)
  const loc2 = res2.headers.get('location')
  console.log(`   Response Status: ${res2.status}`)
  console.log(`   Redirect Location: ${loc2}`)
  if (res2.status === 307 && loc2?.includes('/portal')) {
    console.log('✅ TEST 2 PASSED: Root / on access host resolved to /portal!\n')
  } else {
    throw new Error(`TEST 2 FAILED: Expected redirect to /portal, got status ${res2.status} and location ${loc2}`)
  }

  // Test 3: getSafeReturnUrl resolution for absolute production return URLs
  console.log('📌 TEST 3: getSafeReturnUrl resolution for absolute return_to parameter')
  const returnTarget = 'https://access.lubbalmandumah.com/portal'
  const resolvedReturn = await getSafeReturnUrl(returnTarget)
  console.log(`   Input return_to: ${returnTarget}`)
  console.log(`   Resolved return: ${resolvedReturn}`)
  if (resolvedReturn === 'https://access.lubbalmandumah.com/portal') {
    console.log('✅ TEST 3 PASSED: Absolute access host return URL preserved strictly!\n')
  } else {
    throw new Error(`TEST 3 FAILED: Expected ${returnTarget}, got ${resolvedReturn}`)
  }

  // Test 4: Requesting /portal on www.lubbalmandumah.com
  console.log('📌 TEST 4: Requesting /portal on www.lubbalmandumah.com')
  const req4 = new NextRequest('https://www.lubbalmandumah.com/portal', {
    headers: { host: 'www.lubbalmandumah.com' }
  })
  const res4 = await proxy(req4)
  const loc4 = res4.headers.get('location')
  console.log(`   Response Status: ${res4.status}`)
  console.log(`   Redirect Location: ${loc4}`)
  if (res4.status === 301 && loc4 === 'https://access.lubbalmandumah.com/portal') {
    console.log('✅ TEST 4 PASSED: Public website /portal redirected 301 to access.lubbalmandumah.com/portal!\n')
  } else {
    throw new Error(`TEST 4 FAILED: Expected 301 redirect to access.lubbalmandumah.com/portal, got status ${res4.status} and location ${loc4}`)
  }

  console.log('🎉 ALL SERVER-SIDE REDIRECT-CHAIN TESTS PASSED 100% CLEANLY!')
}

testRedirectChain().catch(err => {
  console.error('❌ REDIRECT CHAIN TEST FAILED:', err)
  process.exit(1)
})
