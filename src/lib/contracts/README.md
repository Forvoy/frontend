# 📁 Contracts Directory - Architecture Guide

## 🎯 Overview

This directory contains **all smart contract integration code** organized by contract type for better maintainability and scalability.

## 📂 Directory Structure

```
lib/contracts/
├── index.ts                    # Main export point - import from here
├── utils.shared.ts             # Shared utilities (parseUSDC, formatUSDC, etc.)
├── types.shared.ts             # Shared TypeScript types
│
├── Forter/
│   ├── index.ts               # Re-exports read + write + mappers
│   ├── read.ts                # Read-only contract calls
│   ├── write.ts               # Transaction/write calls
│   └── mappers.ts             # Contract data → Frontend type mapping
│
├── ReputationNFT/
│   ├── index.ts
│   ├── read.ts
│   ├── write.ts
│   └── mappers.ts
│
├── StakingPool/
│   ├── index.ts
│   ├── read.ts
│   └── write.ts
│
├── Token/
│   ├── index.ts
│   ├── read.ts
│   └── write.ts
│
└── README.md                   # This file
```

## 🚀 Usage Examples

### ✅ Recommended: Import from main index

```typescript
// ✅ GOOD: Import from main contracts index
import {
  getNewsById,
  createNews,
  stakeOnPool,
  getUserReputation,
  handleContractError
} from '@/lib/contracts';

// Use the functions
const news = await getNewsById('1');
const result = await createNews(title, desc, category, criteria, date);
```

### ❌ Avoid: Deep imports

```typescript
// ❌ BAD: Don't import directly from subfolders
import { getNewsById } from '@/lib/contracts/Forter/read';

// Use main index instead!
```

## 📚 Available Functions by Contract

### 🗞️ **Forter Contract** (News & Pools)

**Read Operations:**
```typescript
getNewsCount() → number
getNewsById(newsId) → News | null
getPoolsByNewsId(newsId) → Pool[]
getPoolById(newsId, poolId) → Pool | null
getPoolsByCreator(address) → { newsIds, poolIds }
getUserStake(newsId, poolId, address) → StakeData | null
getNewsResolutionInfo(newsId) → ResolutionInfo | null
```

**Write Operations:**
```typescript
createNews(title, desc, category, criteria, date) → TransactionResult
createPool(newsId, reasoning, evidence, image, position, stake) → TransactionResult
stakeOnPool(newsId, poolId, amount, position) → TransactionResult
resolveNews(newsId, outcome, source, notes) → TransactionResult
```

### 🏆 **ReputationNFT Contract**

**Read Operations:**
```typescript
getUserReputation(address) → ReputationData | null
```

**Write Operations:**
```typescript
mintReputationNFT(address) → TransactionResult
updateReputation(address, score, correct, staked) → TransactionResult
```

### 💰 **StakingPool Contract**

**Read Operations:**
```typescript
getPoolStakeStats(newsId, poolId) → PoolStakeStats | null
```

**Write Operations:**
```typescript
withdrawStake(newsId, poolId) → TransactionResult
emergencyWithdraw(newsId, poolId) → TransactionResult
```

### 🪙 **Token Contract** (USDC)

**Read Operations:**
```typescript
getUSDCBalance(address) → number
getUSDCAllowance(owner, spender) → number
```

**Write Operations:**
```typescript
approveUSDC(spender, amount) → TransactionResult
transferUSDC(to, amount) → TransactionResult
```

## 🛠️ Shared Utilities

```typescript
// Conversion utilities
parseUSDC(amount) → bigint           // Convert number to USDC wei (6 decimals)
formatUSDC(amount) → string          // Convert wei to readable USDC

timestampToDate(timestamp) → Date    // Unix timestamp → Date
dateToTimestamp(date) → bigint       // Date → Unix timestamp

positionToString(bool) → 'YES'|'NO'  // Boolean → Position string
stringToPosition(str) → boolean      // Position string → Boolean

// Error handling
handleContractError(error) → string  // User-friendly error messages
```

## 📦 Service Layer Integration

Services use these contract functions transparently:

```typescript
// In news.service.ts
import { getNewsById, createNews } from '@/lib/contracts';

class NewsService {
  async getById(id: string) {
    if (!isContractsEnabled()) {
      return MOCK_DATA; // Fallback to mock
    }
    return getNewsById(id); // Use contract
  }
}
```

## 🔄 Migration Guide

### Old Structure → New Structure

**Before:**
```typescript
import { getNewsById as getNewsContractById } from '@/lib/contracts/utils';
```

**After:**
```typescript
import { getNewsById } from '@/lib/contracts';
```

All old function names have **backward compatibility aliases** in `index.ts`, so existing code will still work!

## ✨ Benefits of New Structure

1. **🎯 Clear Separation**: Read vs Write operations
2. **📁 Contract-based Organization**: Easy to find functions
3. **📈 Scalability**: Adding new contracts is simple
4. **🔧 Maintainability**: Changes isolated per contract
5. **🔍 Type Safety**: Contract-specific types
6. **🧪 Testability**: Easy to mock individual contracts
7. **📖 Documentation**: Self-documenting structure

## 🚨 Important Notes

### Two-Step Transactions

Most write operations require **USDC approval first**:

```typescript
// ❌ DON'T: Manual approval (already handled)
await approveUSDC(forterAddress, amount);
await stakeOnPool(newsId, poolId, amount, position);

// ✅ DO: Just call the function (approval is automatic)
await stakeOnPool(newsId, poolId, amount, position);
// Internal: approve → wait → stake → wait → return
```

### Error Handling

```typescript
import { handleContractError } from '@/lib/contracts';

try {
  await createPool(...);
} catch (error) {
  const message = handleContractError(error);
  toast.error(message); // User-friendly message
}
```

### Type Safety

```typescript
import type { TransactionResult, NewsContractData } from '@/lib/contracts';

const result: TransactionResult = await createNews(...);
if (result.success) {
  console.log('Transaction hash:', result.hash);
}
```

## 📝 Adding New Contracts

To add a new contract (e.g., `Governance`):

1. **Create folder**: `lib/contracts/Governance/`
2. **Add files**:
   - `read.ts` - Read operations
   - `write.ts` - Write operations
   - `mappers.ts` - Data mapping (if needed)
   - `index.ts` - Re-export all
3. **Update main index**: Add exports to `lib/contracts/index.ts`
4. **Done!** Use via `import { ... } from '@/lib/contracts'`

## 🎓 Best Practices

1. ✅ Always import from main index (`@/lib/contracts`)
2. ✅ Use shared utilities for common operations
3. ✅ Handle errors with `handleContractError()`
4. ✅ Keep read/write functions separated
5. ✅ Add JSDoc comments to all functions
6. ✅ Use TypeScript types from `types.shared.ts`

---

**Questions?** Check the implementation in any service file (e.g., `news.service.ts`) for real-world examples!
