import { FiniteStateMachine } from 'runed';
import { UseBoolean } from '$lib/hooks/use-boolean.svelte.js';

type MyStates = 'running' | 'stopped';
type MyEvents = 'toggle' | 'stop' | 'start';

export let isContainerizationActive = new UseBoolean(false);
