import {
    createContainerCommand,
    validateCommandOutput
} from '$lib/services/containerization/utils';
import type { Output } from '$lib/services/containerization/models';

export async function getAllImages(): Promise<Output> {
    const command = createContainerCommand(['image', 'ls', '--format', 'json']);
    const output = await command.execute();
    return validateCommandOutput(output);
}

export function createPullImageCommand(imageDetails: Array<string>) {
    return createContainerCommand(['image', 'pull', ...imageDetails]);
}

export async function pullImage(imageDetails: Array<string>): Promise<Output> {
    const command = createContainerCommand(['image', 'pull', ...imageDetails]);
    const output = await command.execute();
    return validateCommandOutput(output);
}

export async function removeImage(imageReference: string): Promise<Output> {
    return removeMultipleImages([imageReference]);
}

export async function removeMultipleImages(imagesReference: Array<string>): Promise<Output> {
    const command = createContainerCommand(['image', 'rm', imagesReference.join(' ')]);
    const output = await command.execute();
    return validateCommandOutput(output);
}
