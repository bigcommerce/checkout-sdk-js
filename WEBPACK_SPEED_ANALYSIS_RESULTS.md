# Webpack Build Speed Analysis Results

**Date:** July 11, 2025  
**Tool:** speed-measure-webpack-plugin v1.5.0  
**Command:** `npm run bundle:speed`

## Executive Summary

The webpack build analysis reveals that the total build time is approximately **4 minutes 23 seconds**, with the main bottlenecks being TypeScript compilation and Babel transformation. The build processes 1,260+ modules across two configurations (CJS and UMD).

## Build Configuration Overview

| Configuration | Build Time | Module Count | Main Outputs |
|---------------|------------|--------------|--------------|
| CJS | 2 min 8.9 sec | 1,260 modules | checkout-sdk.js (1.37 MiB), checkout-button.js (521 KiB) |
| UMD | 2 min 14.46 sec | 1,939 modules | checkout-sdk.umd.js (1.92 MiB), checkout-button.umd.js (936 KiB) |

## Detailed Performance Breakdown

### CJS Build (2 min 8.9 sec)

#### Loaders Performance
| Loader Combination | Time | Module Count | Impact |
|---------------------|------|--------------|---------|
| babel-loader + ts-loader + source-map-loader | 1 min 25.084 sec | 619 modules | 🔴 Critical |
| ts-loader + source-map-loader | 1 min 24.8 sec | 641 modules | 🔴 Critical |
| babel-loader + source-map-loader | 59.22 sec | 380 modules | 🟡 High |
| source-map-loader | 13.92 sec | 296 modules | 🟢 Moderate |
| modules with no loaders | 2.072 sec | 3 modules | 🟢 Low |

#### Plugins Performance
| Plugin | Time | Impact |
|--------|------|---------|
| DefinePlugin | 0.001 sec | 🟢 Minimal |

#### Webpack Internal Timings
| Phase | Time | Notes |
|-------|------|-------|
| make hook | 98.32 sec | Module compilation |
| seal compilation | 35.86 sec | Optimization phase |
| process assets | 30.40 sec | Asset processing |
| code generation | 2.59 sec | Code generation |
| create chunk assets | 1.83 sec | Chunk creation |

### UMD Build (2 min 14.46 sec)

#### Loaders Performance
| Loader Combination | Time | Module Count | Impact |
|---------------------|------|--------------|---------|
| ts-loader + source-map-loader | 1 min 27.13 sec | 1,260 modules | 🔴 Critical |
| modules with no loaders | 0 sec | 20 modules | 🟢 Minimal |

#### Webpack Internal Timings
| Phase | Time | Notes |
|-------|------|-------|
| make hook | 87.16 sec | Module compilation |
| seal compilation | 41.45 sec | Optimization phase |
| process assets | 36.73 sec | Asset processing |
| create chunk assets | 2.77 sec | Chunk creation |
| code generation | 1.35 sec | Code generation |

## Key Issues Identified

### 1. **TypeScript Compilation Bottleneck** 🔴
- **Impact:** ~85% of build time
- **Details:** Processing 1,260+ TypeScript modules
- **Affected Phases:** ts-loader operations across both builds

### 2. **Babel Transformation Overhead** 🟡
- **Impact:** ~60 seconds in CJS build
- **Details:** Lodash file (500KB+) causing deoptimization warning
- **Warning:** `[BABEL] Note: The code generator has deoptimised the styling of lodash.js as it exceeds the max of 500KB`

### 3. **Source Map Generation** 🟡
- **Impact:** Added to every loader operation
- **Details:** Increases processing time for all modules
- **Trade-off:** Development debugging vs build speed

### 4. **Large Bundle Sizes** 🟠
- **checkout-sdk.umd.js:** 1.92 MiB
- **checkout-button.umd.js:** 936 KiB
- **Webpack warnings:** Assets exceed 244 KiB recommended limit

## Optimization Recommendations

### High Impact (Estimated 40-60% improvement)

1. **Replace ts-loader with esbuild-loader**
   ```bash
   npm install --save-dev esbuild-loader
   ```
   - Expected improvement: 50-70% faster TypeScript compilation

2. **Use SWC instead of Babel**
   ```bash
   npm install --save-dev @swc/core
   ```
   - You already have `@swc/core-linux-x64-gnu` as optional dependency
   - Expected improvement: 10-20x faster than Babel

### Medium Impact (Estimated 15-30% improvement)

3. **Enable TypeScript incremental compilation**
   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": ".tsbuildinfo"
     }
   }
   ```

4. **Optimize source map generation**
   ```javascript
   // Use faster source map options
   devtool: process.env.NODE_ENV === 'development' ? 'eval-cheap-module-source-map' : 'source-map'
   ```

5. **Add loader caching**
   ```javascript
   // webpack.config.js
   module.exports = {
     cache: {
       type: 'filesystem',
     }
   }
   ```

### Low Impact (Estimated 5-15% improvement)

6. **Exclude unnecessary files from Babel**
   ```javascript
   {
     test: /\.js$/,
     loader: 'babel-loader',
     exclude: [
       /node_modules\/lodash/,
       /node_modules\/core-js/,
       /node_modules\/webpack/
     ]
   }
   ```

7. **Use webpack 5 persistent caching**
   ```javascript
   module.exports = {
     cache: {
       type: 'filesystem',
       buildDependencies: {
         config: [__filename],
       },
     }
   }
   ```

## Bundle Analysis Insights

### Asset Size Distribution (UMD)
- **checkout-sdk.umd.js:** 1.92 MiB (55.4%)
- **checkout-button.umd.js:** 936 KiB (27.0%)
- **hosted-form.umd.js:** 364 KiB (10.5%)
- **hosted-form-v2-iframe-content.umd.js:** 284 KiB (8.2%)
- **Other bundles:** < 200 KiB each

### Module Distribution
- **Core packages:** 5.56 MiB (77.5%)
- **RxJS:** 309 KiB (4.3%)
- **Core-js polyfills:** 335 KiB (4.7%)
- **BigCommerce packages:** 225 KiB (3.1%)
- **Other dependencies:** 745 KiB (10.4%)

## Monitoring and Next Steps

### Baseline Metrics
- **Current total build time:** 4 min 23 sec
- **CJS build time:** 2 min 9 sec
- **UMD build time:** 2 min 14 sec
- **Module count:** 1,260+ modules

### Recommended Testing Approach
1. Implement one optimization at a time
2. Run `npm run bundle:speed` after each change
3. Document improvements in this file
4. Target: Reduce build time to under 2 minutes total

### Future Analysis
- Run weekly speed analysis to detect regressions
- Monitor impact of new dependencies on build time
- Consider splitting large bundles for better performance

---

**Note:** This analysis was generated using `speed-measure-webpack-plugin`. The plugin adds some overhead (~5-10%), so actual build times without measurement may be slightly faster.
