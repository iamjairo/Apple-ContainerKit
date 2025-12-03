type CreateContainerDrawerData = {
    open: boolean;
    selected: string | null;
};

export const createContainerDrawerData = $state<CreateContainerDrawerData>({
    open: false,
    selected: null
});
