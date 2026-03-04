/*
Copyright 2025-2026 EtherCorps

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
# Functional Programming - Implementation Start Guide

**Choose Functional Programming!** This guide will help you implement Phase 1 using pure functions, immutable data, and composition.

---

## 🎯 Quick Overview

### What You're Building (Functional Style)

**Before (OOP)**
```typescript
class CommandBuilder {
  private args: string[] = [];
  execute() { }
}

class ContainerService {
  async list() { }
}
```

**After (Functional)** ✨
```typescript
type CommandConfig = { command: string; args: readonly string[] };

const listContainers = async (): Promise<Result<Container[]>> =>
  pipe(
    buildCommand('container'),
    withArgs('ls', '-a', '--format', 'json'),
    executeCommand,
    validateResult,
    (r) => flatMap(r, parseContainers)
  );
```

---

## 📋 Phase 1 Implementation Checklist (Functional)

### Week 1: Foundation

#### Day 1-2: Result Type & Helpers
- [ ] Create `src/lib/services/containerization/types/result.ts`
- [ ] Define `Result<T, E>` discriminated union
- [ ] Implement helpers: `isSuccess`, `isFailure`, `map`, `flatMap`, `fold`, `pipe`
- [ ] Test: All functions work correctly

#### Day 3-4: Type Definitions
- [ ] Create `src/lib/services/containerization/types/common.ts` (brand types)
- [ ] Create `src/lib/services/containerization/types/container.ts`
- [ ] Create `src/lib/services/containerization/types/image.ts`
- [ ] Create validation functions for each type
- [ ] Test: Type guards work

#### Day 5: Command & Constants
- [ ] Create `src/lib/services/containerization/core/command.ts`
- [ ] Create `src/lib/services/containerization/constants.ts`
- [ ] Create `src/lib/services/containerization/index.ts` (exports)
- [ ] Test: Can build and execute commands

---

## 🛠️ Implementation Files (Copy-Paste Ready)

### 1. Result Type & Helpers

**File**: `src/lib/services/containerization/types/result.ts`

```typescript
/**
 * Result type - represents success or failure
 * Replaces exception-based error handling
 */
export type Result<T, E = string> =
  | { tag: 'success'; value: T; warning?: string }
  | { tag: 'failure'; error: E; stderr: string };

// Type guards
export const isSuccess = <T, E>(result: Result<T, E>): result is { tag: 'success'; value: T; warning?: string } =>
  result.tag === 'success';

export const isFailure = <T, E>(result: Result<T, E>): result is { tag: 'failure'; error: E; stderr: string } =>
  result.tag === 'failure';

// Transformers
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> =>
  isSuccess(result)
    ? { tag: 'success', value: fn(result.value), warning: result.warning }
    : result;

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> =>
  isSuccess(result) ? fn(result.value) : result;

export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> =>
  isFailure(result)
    ? { tag: 'failure', error: fn(result.error), stderr: result.stderr }
    : result;

// Extract value
export const fold = <T, E, U>(
  result: Result<T, E>,
  onSuccess: (value: T) => U,
  onFailure: (error: E) => U
): U =>
  isSuccess(result) ? onSuccess(result.value) : onFailure(result.error);

export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  isSuccess(result) ? result.value : defaultValue;

// Composition
export const pipe = <T>(value: T, ...fns: Array<(x: any) => any>): any =>
  fns.reduce((acc, fn) => fn(acc), value);

export const compose = <A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
): (a: A) => C =>
  (a) => g(f(a));

// Batch operations
export const validateBatch = <T, E>(
  results: Result<T, E>[]
): Result<T[], E> => {
  const failures = results.filter(isFailure);

  if (failures.length > 0) {
    const firstFailure = failures[0];
    return {
      tag: 'failure',
      error: firstFailure.error,
      stderr: failures.map((f) => f.stderr).join('\n')
    };
  }

  return {
    tag: 'success',
    value: results.filter(isSuccess).map((r) => r.value)
  };
};

// Retry logic (higher-order function)
export const withRetry = <T, E>(
  fn: () => Promise<Result<T, E>>,
  maxAttempts: number = 3
): (() => Promise<Result<T, E>>) =>
  async () => {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await fn();
      if (isSuccess(result)) return result;
      if (i === maxAttempts - 1) return result;
    }
    return {
      tag: 'failure',
      error: 'Max retries exceeded' as any,
      stderr: ''
    };
  };
```

---

### 2. Type Definitions

**File**: `src/lib/services/containerization/types/common.ts`

```typescript
// Brand types for compile-time safety
export type ContainerId = string & { readonly __brand: 'ContainerId' };
export type ImageReference = string & { readonly __brand: 'ImageReference' };
export type DomainName = string & { readonly __brand: 'DomainName' };

// Validators return Result
import type { Result } from './result';

export const createContainerId = (id: string): Result<ContainerId> =>
  id.length > 0 && /^[a-zA-Z0-9_.-]+$/.test(id)
    ? { tag: 'success', value: id as ContainerId }
    : { tag: 'failure', error: `Invalid container ID: ${id}`, stderr: '' };

export const createImageReference = (ref: string): Result<ImageReference> =>
  ref.length > 0
    ? { tag: 'success', value: ref as ImageReference }
    : { tag: 'failure', error: `Invalid image reference: ${ref}`, stderr: '' };

export const createDomainName = (name: string): Result<DomainName> =>
  /^[a-z0-9.-]+$/i.test(name)
    ? { tag: 'success', value: name as DomainName }
    : { tag: 'failure', error: `Invalid domain name: ${name}`, stderr: '' };

// Immutable data types
export type Container = {
  readonly id: ContainerId;
  readonly name: string;
  readonly status: 'running' | 'stopped' | 'paused' | 'exited';
  readonly image: ImageReference;
  readonly created: Date;
  readonly ports: readonly Port[];
};

export type Port = {
  readonly internal: number;
  readonly external?: number;
  readonly protocol: 'tcp' | 'udp';
};

export type Image = {
  readonly id: string;
  readonly reference: ImageReference;
  readonly created: Date;
  readonly size: number;
};
```

**File**: `src/lib/services/containerization/types/container.ts`

```typescript
import type { ContainerId, ImageReference, Port, Container } from './common';

export type ContainerSummary = Pick<Container, 'id' | 'name' | 'status' | 'image'>;

export type ContainerState = 'running' | 'stopped' | 'paused' | 'exited' | 'dead';

export type ContainerInspection = Container & {
  readonly pidNumber: number;
  readonly exitCode: number;
  readonly workingDir: string;
  readonly environment: Record<string, string>;
  readonly labels: Record<string, string>;
};

export type CreateContainerOptions = {
  readonly name?: string;
  readonly image: ImageReference;
  readonly command?: readonly string[];
  readonly environment?: Record<string, string>;
  readonly ports?: readonly Port[];
  readonly labels?: Record<string, string>;
};
```

**File**: `src/lib/services/containerization/types/image.ts`

```typescript
import type { ImageReference } from './common';

export type ImageSummary = {
  readonly id: string;
  readonly reference: ImageReference;
  readonly created: Date;
  readonly size: number;
};

export type ImageInspection = ImageSummary & {
  readonly architecture: string;
  readonly os: string;
  readonly author: string;
  readonly config: {
    readonly entrypoint?: readonly string[];
    readonly cmd?: readonly string[];
    readonly workingDir: string;
    readonly environment: Record<string, string>;
    readonly exposedPorts?: Record<string, unknown>;
  };
};

export type ImagePullOptions = {
  readonly platform?: string;
  readonly quiet?: boolean;
};

export type ImagePullResponse = {
  readonly imageId: string;
  readonly imageReference: ImageReference;
  readonly digest: string;
};
```

---

### 3. Command Building (Functional)

**File**: `src/lib/services/containerization/core/command.ts`

```typescript
import { Command, type ChildProcess } from '@tauri-apps/plugin-shell';

// Immutable command configuration
export type CommandConfig = {
  readonly command: string;
  readonly args: readonly string[];
  readonly timeout?: number;
};

// Pure functions to build commands
export const buildCommand = (command: string): CommandConfig => ({
  command,
  args: [],
  timeout: undefined
});

export const withArgs = (
  config: CommandConfig,
  ...args: string[]
): CommandConfig => ({
  ...config,
  args: [...config.args, ...args]
});

export const withFlag = (
  config: CommandConfig,
  flag: string,
  value?: string
): CommandConfig => ({
  ...config,
  args: [...config.args, flag, ...(value ? [value] : [])]
});

export const withTimeout = (
  config: CommandConfig,
  timeoutMs: number
): CommandConfig => ({
  ...config,
  timeout: timeoutMs
});

// Helper factories
export const containerCommand = (args: readonly string[]): CommandConfig =>
  withArgs(buildCommand('container'), ...args);

export const systemCommand = (args: readonly string[]): CommandConfig =>
  withArgs(buildCommand('system'), ...args);

// Execution
export const executeCommand = async (
  config: CommandConfig
): Promise<ChildProcess<string>> => {
  const cmd = Command.create(config.command, [...config.args]);

  if (!config.timeout) {
    return cmd.execute();
  }

  return Promise.race([
    cmd.execute(),
    new Promise<ChildProcess<string>>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout after ${config.timeout}ms`)),
        config.timeout
      )
    )
  ]);
};

// Display (for logging/debugging)
export const commandToString = (config: CommandConfig): string =>
  `${config.command} ${config.args.join(' ')}`;
```

---

### 4. Constants (All Immutable)

**File**: `src/lib/services/containerization/constants.ts`

```typescript
// Commands
export const COMMANDS = {
  CONTAINER: 'container',
  SYSTEM: 'system',
  IMAGE: 'image'
} as const;

// Container actions
export const CONTAINER_ACTIONS = {
  LIST: 'ls',
  RUN: 'run',
  START: 'start',
  STOP: 'stop',
  REMOVE: 'rm',
  INSPECT: 'inspect',
  LOGS: 'logs',
  CREATE: 'create',
  PAUSE: 'pause',
  UNPAUSE: 'unpause'
} as const;

// Image actions
export const IMAGE_ACTIONS = {
  LIST: 'ls',
  PULL: 'pull',
  REMOVE: 'rm',
  INSPECT: 'inspect',
  SAVE: 'save',
  LOAD: 'load',
  TAG: 'tag',
  BUILD: 'build'
} as const;

// System actions
export const SYSTEM_ACTIONS = {
  STATUS: 'status',
  START: 'start',
  STOP: 'stop',
  RESTART: 'restart',
  PROPERTY: 'property'
} as const;

// Timeouts
export const TIMEOUTS = {
  SHORT: 5000,      // Quick operations
  NORMAL: 30000,    // Standard operations
  LONG: 300000,     // Pull/push (5 min)
  VERY_LONG: 900000 // Build (15 min)
} as const;

// Container states
export const CONTAINER_STATES = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  PAUSED: 'paused',
  EXITED: 'exited',
  DEAD: 'dead'
} as const;

// Output formats
export const OUTPUT_FORMATS = {
  JSON: 'json',
  TABLE: 'table'
} as const;

// Helper: Get format JSON flag
export const formatJSON = (): readonly [string, string] => ['--format', 'json'];

// Helper: Get timeout value
export const getTimeout = (key: keyof typeof TIMEOUTS): number => TIMEOUTS[key];
```

---

### 5. Validation Functions

**File**: `src/lib/services/containerization/core/validation.ts`

```typescript
import type { ChildProcess } from '@tauri-apps/plugin-shell';
import type { Result } from '../types/result';

// Predicates (pure boolean functions)
export const isSuccessful = (output: ChildProcess<string>): boolean =>
  output.code === 0;

export const hasOutput = (output: ChildProcess<string>): boolean =>
  !!output.stdout && output.stdout.length > 0;

export const isJSON = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

// Validators
export const validateCommandOutput = (
  output: ChildProcess<string>
): Result<string> =>
  isSuccessful(output)
    ? { tag: 'success', value: output.stdout, warning: output.stderr }
    : {
        tag: 'failure',
        error: 'Command failed',
        stderr: output.stderr || `Exit code: ${output.code}`
      };

export const validateJSON = (text: string): Result<unknown> =>
  isJSON(text)
    ? { tag: 'success', value: JSON.parse(text) }
    : {
        tag: 'failure',
        error: 'Invalid JSON',
        stderr: text.substring(0, 100)
      };

export const validateNonEmpty = <T extends { length: number }>(
  value: T,
  name: string = 'value'
): Result<T> =>
  value.length > 0
    ? { tag: 'success', value }
    : { tag: 'failure', error: `${name} is empty`, stderr: '' };

// Composition validator
export const validateThen = <T, E>(
  result: Result<T, E>,
  validator: (value: T) => Result<T, E>
): Result<T, E> =>
  result.tag === 'success' ? validator(result.value) : result;
```

---

### 6. Parser Functions

**File**: `src/lib/services/containerization/core/parsers.ts`

```typescript
import type { Result } from '../types/result';
import type { Container, Image, ContainerId, ImageReference } from '../types/common';
import { createContainerId, createImageReference } from '../types/common';

// Type guards for JSON objects
const isContainerJSON = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && 'id' in value && 'status' in value;

const isImageJSON = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && 'id' in value && 'size' in value;

// Parse single container
export const parseContainer = (json: unknown): Result<Container> =>
  !isContainerJSON(json)
    ? { tag: 'failure', error: 'Invalid container JSON', stderr: '' }
    : {
        tag: 'success',
        value: {
          id: (json as any).id as ContainerId,
          name: (json as any).name || '',
          status: (json as any).status || 'stopped',
          image: (json as any).image as ImageReference,
          created: new Date((json as any).created),
          ports: (json as any).ports || []
        }
      };

// Parse container array
export const parseContainers = (json: unknown): Result<Container[]> =>
  !Array.isArray(json)
    ? { tag: 'failure', error: 'Expected array', stderr: '' }
    : {
        tag: 'success',
        value: json.filter(isContainerJSON).map((item) => {
          const result = parseContainer(item);
          return result.tag === 'success' ? result.value : undefined;
        }).filter((c): c is Container => c !== undefined)
      };

// Parse single image
export const parseImage = (json: unknown): Result<Image> =>
  !isImageJSON(json)
    ? { tag: 'failure', error: 'Invalid image JSON', stderr: '' }
    : {
        tag: 'success',
        value: {
          id: (json as any).id || '',
          reference: (json as any).reference as ImageReference,
          created: new Date((json as any).created),
          size: (json as any).size || 0
        }
      };

// Parse image array
export const parseImages = (json: unknown): Result<Image[]> =>
  !Array.isArray(json)
    ? { tag: 'failure', error: 'Expected array', stderr: '' }
    : {
        tag: 'success',
        value: json.filter(isImageJSON).map((item) => {
          const result = parseImage(item);
          return result.tag === 'success' ? result.value : undefined;
        }).filter((i): i is Image => i !== undefined)
      };
```

---

### 7. Service Functions

**File**: `src/lib/services/containerization/containers.ts`

```typescript
import { executeCommand, containerCommand } from './core/command';
import { validateCommandOutput } from './core/validation';
import { parseContainer, parseContainers } from './core/parsers';
import { CONTAINER_ACTIONS, TIMEOUTS, formatJSON } from './constants';
import type { Result } from './types/result';
import { flatMap, pipe, fold } from './types/result';
import type { Container, ContainerId } from './types/common';

/**
 * List all containers
 */
export const listContainers = async (): Promise<Result<Container[]>> =>
  pipe(
    containerCommand([CONTAINER_ACTIONS.LIST, '-a', ...formatJSON()]),
    (cmd) => ({ ...cmd, timeout: TIMEOUTS.NORMAL }),
    executeCommand,
    (promise) => promise.then(validateCommandOutput),
    (result) => flatMap(result, (json) => {
      try {
        return parseContainers(JSON.parse(json));
      } catch {
        return { tag: 'failure' as const, error: 'Failed to parse JSON', stderr: '' };
      }
    })
  );

/**
 * Get single container details
 */
export const getContainer = (id: ContainerId) =>
  async (): Promise<Result<Container>> =>
    pipe(
      containerCommand([CONTAINER_ACTIONS.INSPECT, id, ...formatJSON()]),
      (cmd) => ({ ...cmd, timeout: TIMEOUTS.NORMAL }),
      executeCommand,
      (promise) => promise.then(validateCommandOutput),
      (result) => flatMap(result, (json) => {
        try {
          return parseContainer(JSON.parse(json));
        } catch {
          return { tag: 'failure' as const, error: 'Failed to parse JSON', stderr: '' };
        }
      })
    );

/**
 * Start a container
 */
export const startContainer = (id: ContainerId) =>
  async (): Promise<Result<void>> =>
    fold(
      await pipe(
        containerCommand([CONTAINER_ACTIONS.START, id]),
        (cmd) => ({ ...cmd, timeout: TIMEOUTS.NORMAL }),
        executeCommand,
        (promise) => promise.then(validateCommandOutput)
      ),
      () => ({ tag: 'success' as const, value: undefined }),
      (error) => ({ tag: 'failure' as const, error, stderr: '' })
    );

/**
 * Stop a container
 */
export const stopContainer = (id: ContainerId) =>
  async (): Promise<Result<void>> =>
    fold(
      await pipe(
        containerCommand([CONTAINER_ACTIONS.STOP, id]),
        (cmd) => ({ ...cmd, timeout: TIMEOUTS.NORMAL }),
        executeCommand,
        (promise) => promise.then(validateCommandOutput)
      ),
      () => ({ tag: 'success' as const, value: undefined }),
      (error) => ({ tag: 'failure' as const, error, stderr: '' })
    );

/**
 * Remove a container
 */
export const removeContainer = (id: ContainerId) =>
  async (): Promise<Result<void>> =>
    fold(
      await pipe(
        containerCommand([CONTAINER_ACTIONS.REMOVE, id]),
        (cmd) => ({ ...cmd, timeout: TIMEOUTS.NORMAL }),
        executeCommand,
        (promise) => promise.then(validateCommandOutput)
      ),
      () => ({ tag: 'success' as const, value: undefined }),
      (error) => ({ tag: 'failure' as const, error, stderr: '' })
    );

/**
 * Get container logs
 */
export const getContainerLogs = (id: ContainerId) =>
  async (): Promise<Result<string>> =>
    pipe(
      containerCommand([CONTAINER_ACTIONS.LOGS, id]),
      (cmd) => ({ ...cmd, timeout: TIMEOUTS.LONG }),
      executeCommand,
      (promise) => promise.then(validateCommandOutput)
    );
```

---

### 8. Public Exports

**File**: `src/lib/services/containerization/index.ts`

```typescript
// Re-export types
export type { Result } from './types/result';
export type { Container, Image, ContainerId, ImageReference } from './types/common';
export type { ContainerSummary, ContainerInspection } from './types/container';
export type { ImageSummary, ImageInspection, ImagePullResponse } from './types/image';

// Re-export helpers
export { isSuccess, isFailure, map, flatMap, fold, pipe, withRetry } from './types/result';

// Re-export services
export {
  listContainers,
  getContainer,
  startContainer,
  stopContainer,
  removeContainer,
  getContainerLogs
} from './containers';

// Re-export constants
export { COMMANDS, CONTAINER_ACTIONS, SYSTEM_ACTIONS, TIMEOUTS, getTimeout } from './constants';

// Convenience service object
export const containerService = {
  list: listContainers,
  get: getContainer,
  start: startContainer,
  stop: stopContainer,
  remove: removeContainer,
  getLogs: getContainerLogs
};
```

---

## 📝 Usage Examples

### In Components

```typescript
<script>
  import { listContainers, isSuccess, fold } from '$lib/services/containerization';

  let containers = [];
  let error: string | null = null;
  let loading = false;

  const loadContainers = async () => {
    loading = true;
    error = null;

    const result = await listContainers();

    fold(
      result,
      (data) => {
        containers = data;
        error = null;
      },
      (err) => {
        containers = [];
        error = err;
      }
    );

    loading = false;
  };
</script>
```

### Composing Operations

```typescript
import { startContainer, stopContainer, pipe, flatMap } from '$lib/services/containerization';

// Start multiple containers
const startMultiple = (ids: ContainerId[]) =>
  Promise.all(ids.map((id) => startContainer(id)()));

// Chain operations (one after another)
const restartContainer = (id: ContainerId) =>
  async () => {
    const stopResult = await stopContainer(id)();
    return flatMap(stopResult, () => startContainer(id)());
  };
```

---

## 🧪 Testing Pure Functions

```typescript
import { describe, it, expect } from 'vitest';
import { parseContainer, parseContainers } from '../core/parsers';
import { isSuccess, fold } from '../types/result';

describe('Functional Container Service', () => {
  describe('parseContainer', () => {
    it('should parse valid container JSON', () => {
      const json = {
        id: 'abc123',
        name: 'test',
        status: 'running',
        image: 'redis',
        created: new Date().toISOString(),
        ports: []
      };

      const result = parseContainer(json);

      fold(
        result,
        (container) => {
          expect(container.id).toBe('abc123');
          expect(container.name).toBe('test');
        },
        (error) => fail(`Should succeed: ${error}`)
      );
    });

    it('should fail on invalid JSON', () => {
      const result = parseContainer('not an object');

      fold(
        result,
        () => fail('Should fail'),
        (error) => {
          expect(error).toContain('Invalid');
        }
      );
    });
  });

  describe('pipe composition', () => {
    it('should compose transformations', () => {
      const result = pipe(
        5,
        (x) => x * 2,
        (x) => x + 3
      );

      expect(result).toBe(13);
    });
  });
});
```

---

## ✅ Phase 1 Completion Checklist

- [ ] All type definition files created and exported
- [ ] Result type works with type guards
- [ ] Command builder creates immutable configs
- [ ] Validators are pure functions
- [ ] Parsers handle JSON safely
- [ ] Service functions use pipe/composition
- [ ] Constants are immutable (as const)
- [ ] Tests for pure functions pass
- [ ] TypeScript strict mode: 0 errors
- [ ] All imports use $lib alias

---

## 🎯 Next Steps

1. **Create directories**:
   ```bash
   mkdir -p src/lib/services/containerization/{types,core}
   ```

2. **Copy files** from this guide into your project

3. **Run tests**: Verify all pure functions work

4. **Move to Phase 2**: Implement more services (images, DNS, network)

---

## 📚 Reference Guides

- **FP Patterns**: `CONTAINERIZATION_FUNCTIONAL_APPROACH.md`
- **Implementation Steps**: `CONTAINERIZATION_MIGRATION_GUIDE.md`
- **Best Practices**: `CONTAINERIZATION_BEST_PRACTICES.md`
- **Quick Reference**: `CONTAINERIZATION_QUICK_REFERENCE.md`

---

**Ready to implement Phase 1? Let's build it functionally! 🚀**
