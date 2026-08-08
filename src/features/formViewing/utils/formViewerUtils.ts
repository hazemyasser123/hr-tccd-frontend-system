export const branchAssertionFormatter = (assertOn: string): string[] => {
    if (!assertOn) return [];
    const trimmed = assertOn.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const inner = trimmed.slice(1, -1).trim();
        if (inner === '') return [];
        return inner.split(/\s*,\s*/).map(s => s.trim());
    }
    return [trimmed];
};